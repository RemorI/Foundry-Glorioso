/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import AttributeBarsDialog from '../applications/AttributeBarsDialog.js';
import CustomDialogV2 from '../applications/CustomDialogV2.js';
import HiddenAttributesDialog from '../applications/HiddenAttributesDialog.js';
import ReloadTemplatesDialog from '../applications/ReloadTemplateDialog.js';
import TemplateSettingsDialog from '../applications/TemplateSettingsDialog.js';
import { isBaseTemplateEntity, isFullTemplateEntity, JSONObject, Primitive, RollOptions } from '../definitions.js';
import { UncomputableError } from '../errors/UncomputableError.js';
import ComputablePhrase from '../formulas/ComputablePhrase.js';
import AttributeBarElement, { isAttributeBarElement } from '../interfaces/AttributeBarElement.js';
import { SendToChatFunction, isChatSenderElement } from '../interfaces/ChatSenderElement.js';
import ComputableElement, {
    ComputeFunction,
    ComputeParameters,
    isComputableElement,
    isComputeFunction
} from '../interfaces/ComputableElement.js';
import Logger from '../Logger.js';
import { CustomActorSheet } from '../sheets/actors/actor-sheet.js';
import { CharacterSheet } from '../sheets/actors/character-sheet.js';
import Component, { ComponentJson, ComponentRenderOptions } from '../sheets/components/Component.js';
import Panel from '../sheets/components/Panel.js';
import { EquippableItemSheet } from '../sheets/items/equippable-item-sheet.js';
import { SubTemplateItemSheet } from '../sheets/items/sub-template-item-sheet.js';
import { UserInputTemplateItemSheet } from '../sheets/items/user-input-template-item-sheet.js';
import { castToPrimitive, getGameCollection, getGameCollectionAsTemplateSystems, removeNull } from '../utils.js';
import CustomActiveEffect from './CustomActiveEffect.js';
import CustomActor from './CustomActor.js';
import CustomItem from './CustomItem.js';
import { CharacterActorDataModel, TemplateActorDataModelSchema } from './model/actorModel.js';
import SimpleAttributeBarElement from './simpleImplementations/SimpleAttributeBarElement.js';
import SimpleComputableElement from './simpleImplementations/SimpleComputableElement.js';

import SchemaField = foundry.data.fields.SchemaField;
import { AnyMutableObject } from 'fvtt-types/utils';

export type AppliedTemplateSystem =
    | TemplateSystem<CustomActor<'character'>>
    | TemplateSystem<CustomItem<'equippableItem'>>;
export type BuilderTemplateSystem =
    | TemplateSystem<CustomActor<'_template'>>
    | TemplateSystem<
          CustomItem<'_equippableItemTemplate'> | CustomItem<'subTemplate'> | CustomItem<'userInputTemplate'>
      >;
export type FullBuilderTemplateSystem =
    | TemplateSystem<CustomActor<'_template'>>
    | TemplateSystem<CustomItem<'_equippableItemTemplate'>>;
export type FullTemplateSystem = AppliedTemplateSystem | FullBuilderTemplateSystem;

/**
 * @ignore
 */
export type TemplateSystemSheetContext = {
    cssClass: string;
    availableTemplates: Array<{ id: string; name: string }>;
    canReload: boolean;
    manualEntitySaving: boolean;
    headerPanel?: JQuery<HTMLElement>;
    bodyPanel?: JQuery<HTMLElement>;
};

/**
 * Agnostic template system used in Actors & Items
 */
class TemplateSystem<T extends CustomActor | CustomItem = CustomActor | CustomItem> {
    static isBuilderTemplateSystem(entity: unknown): entity is BuilderTemplateSystem {
        return (
            !!entity &&
            entity instanceof TemplateSystem &&
            (CustomActor.isTemplateActor(entity.entity) || CustomItem.isTemplateItem(entity.entity))
        );
    }

    static isAppliedTemplateSystem(entity: unknown): entity is AppliedTemplateSystem {
        return (
            !!entity &&
            entity instanceof TemplateSystem &&
            (CustomActor.isCharacterActor(entity.entity) || CustomItem.isEquippableItem(entity.entity))
        );
    }

    static isFullBuilderTemplateSystem(entity: unknown): entity is FullBuilderTemplateSystem {
        return (
            !!entity &&
            entity instanceof TemplateSystem &&
            (CustomActor.isTemplateActor(entity.entity) || CustomItem.isEquippableItemTemplate(entity.entity))
        );
    }

    static isFullTemplateSystem(entity: unknown): entity is FullTemplateSystem {
        return this.isAppliedTemplateSystem(entity) || this.isFullBuilderTemplateSystem(entity);
    }

    /**
     * Unique version number to know when to reload Panels
     */
    private _templateSystemUniqueVersion?: number;

    /**
     * Indicates if this document has been modified
     */
    private _modificationFlag: boolean;

    /**
     * Header part
     */
    public customHeader?: Panel;

    /**
     * Body part
     */
    public customBody?: Panel;

    /**
     * Component map
     */
    private _componentMap: Record<string, Component>;

    /**
     * Timeout object before saving the sheet if delayed is on
     */
    public saveTimeout?: NodeJS.Timeout;

    /**
     * @param entity The entity linked to this TemplateSystem
     */
    constructor(public readonly entity: T) {
        this._componentMap = {};
        this._modificationFlag = false;
    }

    /**
     * Is the entity an assignable Template?
     */
    get isAssignableTemplate(): boolean {
        return this.entity.isAssignableTemplate;
    }

    /**
     * Returns system value for the entity
     */
    get system(): T['system'] {
        return this.entity.system;
    }

    /**
     * Returns the entity uuid
     */
    get uuid() {
        return this.entity.uuid;
    }

    /**
     * Return the type of the entity
     */
    get entityType(): 'actor' | 'item' | undefined {
        switch (this.entity.type) {
            case 'character':
            case '_template':
                return 'actor';
            case 'equippableItem':
            case '_equippableItemTemplate':
            case 'subTemplate':
            case 'userInputTemplate':
            case 'activeEffectContainer':
                return 'item';
        }
    }

    /**
     * Returns the entity's items
     */
    get items() {
        return this.entity.getItems();
    }

    get isModified() {
        return this._modificationFlag;
    }

    set isModified(modificationFlag: boolean) {
        this._modificationFlag = modificationFlag;

        const sheetElement = this.entity.sheet?.element;

        const sheetApplicationTitle =
            sheetElement instanceof HTMLElement
                ? $(sheetElement).find('.window-title')
                : sheetElement?.find('.window-title');

        if (sheetApplicationTitle) {
            const cache = sheetApplicationTitle.children();
            sheetApplicationTitle.text(this.entity.sheet!.title).append(cache);
        }
    }

    /**
     * Gets the component map
     */
    public get componentMap() {
        if (Object.keys(this._componentMap).length === 0) {
            this._prepareTemplateData();
        }

        return this._componentMap;
    }

    /**
     * Renders the entity
     * @param force Render if not opened?
     * @param context Rendering context
     */
    // oxlint-disable-next-line typescript/no-deprecated
    render(force?: boolean, context?: Application.RenderOptions) {
        this.entity.render(force, context);
    }

    /**
     * Prepares entity data
     * @param {boolean} suppressErrorLogs Should errors and warnings be suppressed when preparing data ? Usually true when preparing Base Data
     */
    prepareData() {
        if (CustomActor.isCharacterActor(this.entity)) {
            // @ts-expect-error Outdated types
            // oxlint-disable-next-line typescript/no-unsafe-return typescript/no-unsafe-call
            this.entity._clearData();
        }

        this._prepareTemplateData();

        this._prepareEntityData();
    }

    /**
     * Prepares entity template data
     */
    private _prepareTemplateData() {
        // If template version changed, we need to recompute the components hierarchy
        if (
            TemplateSystem.isAppliedTemplateSystem(this) &&
            this.entity.system.templateSystemUniqueVersion &&
            this._templateSystemUniqueVersion !== this.entity.system.templateSystemUniqueVersion
        ) {
            this._templateSystemUniqueVersion = this.entity.system.templateSystemUniqueVersion;
            this.customHeader = undefined;
            this.customBody = undefined;
        }

        if (isFullTemplateEntity(this.entity) && !this.customHeader && this.entity.system.header) {
            this.customHeader = Panel.fromJSON(this.entity.system.header as ComponentJson, 'header');
        }

        if (isBaseTemplateEntity(this.entity) && !this.customBody) {
            this.customBody = Panel.fromJSON(this.entity.system.body as ComponentJson, 'body');
        }

        this._componentMap = this._getComponentMap();
    }

    /**
     * Prepare Entity type specific data
     */
    private _prepareEntityData() {
        const startTime = performance.now();
        Logger.debug(`Start data preparation for ${this.entity.name} (${this.entity.id}).`);

        if (!TemplateSystem.isAppliedTemplateSystem(this)) return;

        const items = this.items;

        const activeEffectsByKey: Record<
            string,
            Record<
                string,
                Array<{
                    activeEffect: CustomActiveEffect;
                    change: ActiveEffect.ChangeData & { effect: CustomActiveEffect };
                }>
            >
        > = { [this.entity.uuid!]: this.getSortedActiveEffects() };

        // Computing all properties
        const computableComponents: Array<{
            computable: ComputableElement;
            origin: CustomActor<'character'> | CustomItem<'equippableItem'>;
        }> = this.getComputables().map((computable) => ({ computable, origin: this.entity }));

        items.forEach((item) => {
            if (item.isEquippableItem()) {
                computableComponents.push(
                    ...item.templateSystem.getComputables().map((computable) => ({ computable, origin: item }))
                );

                activeEffectsByKey[item.uuid!] = item.templateSystem.getSortedActiveEffects();
            }
        });

        const computeParameters: Array<ComputeFunction | ComputeParameters> = [];
        const entitiesToReset: Record<string, { entity: TemplateSystem; resetProps: AnyMutableObject }> = {};
        for (const { computable, origin } of computableComponents) {
            const componentComputeParameters = computable.getComputeFunctions(origin.templateSystem);

            if (!entitiesToReset[origin.uuid!]) {
                entitiesToReset[origin.uuid!] = {
                    entity: origin.templateSystem,
                    resetProps: {}
                };
            }

            entitiesToReset[origin.uuid!].resetProps = {
                ...entitiesToReset[origin.uuid!].resetProps,
                ...computable.resetComputeValue(
                    componentComputeParameters.map((computeData) => computeData.key),
                    origin.templateSystem
                )
            };

            computeParameters.push(...componentComputeParameters);
        }

        for (const resettingEntity of Object.values(entitiesToReset)) {
            foundry.utils.mergeObject(resettingEntity.entity.system.props!, resettingEntity.resetProps);
            removeNull(resettingEntity.entity.system.props!);
        }

        let uncomputedProps = [...computeParameters];

        let nLoops = 0,
            nComputed = 0;

        // Loop while all props are not computed
        // Some computed properties are used in other computed properties, so we need to make several passes to compute them all
        do {
            nComputed = 0;

            nLoops++;
            const computingRound = [...uncomputedProps];
            uncomputedProps = [];

            // For each uncomputed property, we try to compute it
            for (const computeData of computingRound) {
                try {
                    let newComputedValue: Primitive;

                    if (isComputeFunction(computeData)) {
                        newComputedValue = computeData.function();
                        foundry.utils.setProperty(
                            computeData.context.system.props as AnyMutableObject,
                            computeData.key,
                            castToPrimitive(newComputedValue)
                        );
                    } else {
                        const { formula, options } = computeData;

                        let formulaProps = computeData.context.getRollData();
                        if (options?.customProps) {
                            formulaProps = foundry.utils.mergeObject(formulaProps, options.customProps, {
                                inplace: false
                            });
                        }

                        newComputedValue = ComputablePhrase.computeMessageStatic(formula, formulaProps, {
                            ...options,
                            source: computeData.key,
                            availableKeys: Object.keys(formulaProps),
                            triggerEntity: computeData.context
                        }).result;

                        foundry.utils.setProperty(
                            computeData.context.system.props as AnyMutableObject,
                            computeData.key,
                            castToPrimitive(newComputedValue)
                        );

                        if (activeEffectsByKey[computeData.context.entity.uuid!]?.[computeData.key]) {
                            activeEffectsByKey[computeData.context.entity.uuid!][computeData.key].forEach(
                                ({ activeEffect, change }) => {
                                    try {
                                        if (!activeEffect.active) return;

                                        CustomActiveEffect.applyChange(
                                            computeData.context.entity as
                                                | CustomActor<'character'>
                                                | CustomItem<'equippableItem'>,
                                            change
                                        ) as Record<string, Primitive>;

                                        if (
                                            foundry.utils.getProperty(computeData.context.entity, change.key!) !==
                                                undefined &&
                                            foundry.utils.getProperty(computeData.context.entity, change.key!) !== null
                                        ) {
                                            newComputedValue = foundry.utils.getProperty(
                                                computeData.context.entity,
                                                change.key!
                                            ) as Primitive;
                                        }
                                    } catch (err) {
                                        if (err instanceof UncomputableError) {
                                            Logger.debug(
                                                `Could not compute active effect change for key ${change.key} ${activeEffect.uuid} (${activeEffect.name} from ${activeEffect.parent?.name})`,
                                                err
                                            );

                                            foundry.utils.setProperty(
                                                computeData.context.system.props as AnyMutableObject,
                                                computeData.key,
                                                undefined
                                            );
                                        }

                                        throw err;
                                    }
                                }
                            );
                        }

                        foundry.utils.setProperty(
                            computeData.context.system.props as AnyMutableObject,
                            computeData.key,
                            castToPrimitive(newComputedValue)
                        );

                        Logger.debug(
                            `Computed ${computeData.context.entity.name}#${computeData.key} successfully !`,
                            newComputedValue
                        );
                        nComputed++;
                    }
                } catch (err) {
                    if (err instanceof UncomputableError) {
                        Logger.debug(
                            `Passing prop ${computeData.context.entity.name}#${computeData.key} to next round of computation...`,
                            err
                        );
                        foundry.utils.setProperty(
                            computeData.context.system.props as AnyMutableObject,
                            computeData.key,
                            undefined
                        );
                        uncomputedProps.push(computeData);
                    } else {
                        throw err;
                    }
                }
            }

            Logger.debug(
                `Computed props for ${this.entity.name} - ${nComputed} computed - ${uncomputedProps.length} uncomputed`,
                {
                    leftToCompute: uncomputedProps
                }
            );
        } while (
            // If no uncomputed props are left, we computed everything, and we can stop
            // If computedProps is empty, that means nothing was computed in this loop, and there is an error in the property definitions
            // Probably a wrongly defined formula, or a loop in property definition
            Object.keys(uncomputedProps).length > 0 &&
            nComputed > 0
        );

        // We log the remaining uncomputable properties for debug
        if (Object.keys(uncomputedProps).length > 0) {
            Logger.warn(`Some props were not computed. (From ${this.entity.name} (${this.entity.id})`, {
                uncomputedProps,
                scope: this.entity.getRollData()
            });
        }
        Logger.info(`All props for ${this.entity.name} (${this.entity.id}) computed in ${nLoops} loops.`);

        if (CustomActor.isCharacterActor(this.entity)) {
            this.entity.applyActiveEffects('initial');
            this.entity.applyActiveEffects('final');
        }

        if (this.entityType === 'actor') {
            const attributeBars: Record<string, AttributeBarElement> = {
                ...Object.entries((this.system as CharacterActorDataModel).attributeBar ?? {}).reduce(
                    (res: Record<string, AttributeBarElement>, [key, attributeBar]) => (
                        (res[key] = new SimpleAttributeBarElement(
                            key,
                            attributeBar.value,
                            attributeBar.max,
                            attributeBar.editable
                        )),
                        res
                    ),
                    {}
                ),
                ...Object.keys(this.componentMap)
                    .filter((key) => isAttributeBarElement(this.componentMap[key]))
                    .reduce(
                        (res: Record<string, AttributeBarElement>, key) => (
                            (res[key] = this.componentMap[key] as unknown as AttributeBarElement),
                            res
                        ),
                        {}
                    )
            };

            for (const prop in attributeBars) {
                const max = attributeBars[prop].getMaxValue(this);
                const value = attributeBars[prop].getValue(this);
                const editable = attributeBars[prop].isEditable();

                foundry.utils.setProperty((this.entity.system as CharacterActorDataModel).attributeBar, prop, {
                    value: value,
                    max: max,
                    key: prop,
                    editable: editable
                });
            }
        }

        const endTime = performance.now();
        Logger.info(
            `Done preparing data for ${this.entity.name} (${this.entity.uuid}) in ${endTime - startTime} ms - ${computeParameters.length} props computed.`
        );
    }

    /**
     * Can the current entity own the new Item ?
     * @param newItem The new CustomItem to add
     * @return Boolean indicating if the Item is ownable
     */
    canOwnItem(newItem: CustomItem): boolean {
        if (TemplateSystem.isBuilderTemplateSystem(this)) {
            return false;
        }
        if (!CustomItem.isEquippableItem(newItem)) {
            return false;
        }
        if (newItem.system.unique) {
            return !this.items.some((item) => item.system.uniqueId === newItem.system.uniqueId);
        }

        return true;
    }

    /**
     * Creates items in the entity
     *
     * @param itemsData The items data to create
     * @param renderItemSheet Whether to render the item sheets after creation
     */
    addItems(itemsData: Array<Item.CreateData>, renderItemSheet: boolean) {
        const postCreateItems = (newItems: Array<CustomItem>) => {
            newItems.forEach((item) => {
                void item.templateSystem.reloadTemplate().then(() => {
                    if (renderItemSheet) {
                        // oxlint-disable-next-line @typescript-eslint/no-deprecated
                        void item.sheet?.render(true);
                    }
                });
            });
        };

        if (this.entity instanceof CustomItem) {
            itemsData = itemsData.map((itemData) => {
                return {
                    ...itemData,
                    folder: CustomItem.getEmbeddedItemsFolder() ?? null,
                    system: {
                        ...itemData.system,
                        container: this.entity.id
                    }
                };
            });
        }

        if (this.entity instanceof CustomActor || (this.entity instanceof CustomItem && this.entity.parent)) {
            const topEntity = this.entity instanceof CustomActor ? this.entity : this.entity.parent!;

            void topEntity.createEmbeddedDocuments('Item', itemsData).then(postCreateItems);
        } else {
            void CustomItem.createDocuments(itemsData).then(postCreateItems);
        }
    }

    /**
     * Get data useful for sheets only
     * @param context The entity sheet data
     * @return The updated entity sheet data
     */
    async getSheetData(): Promise<TemplateSystemSheetContext> {
        const availableTemplates = getGameCollectionAsTemplateSystems(this.entityType)
            .filter((entity) => entity.isAssignableTemplate)
            .map((entity) => {
                return { id: entity.entity.id!, name: entity.entity.name };
            });

        // Tokens don't automatically have their actors prepared...
        if (!this.customHeader && !this.customBody) {
            this.prepareData();
        }

        // Add the entity's data to context.system for easier access, as well as flags.
        const extendedContext = {
            cssClass: (this.entity.sheet as foundry.applications.api.DocumentSheetV2.Any).isEditable
                ? 'editable'
                : 'locked',
            availableTemplates,
            canReload: game.user.hasRole(
                game.settings.get(game.system.id, 'minimumRoleTemplateReloading') as CONST.USER_ROLES
            ),
            manualEntitySaving: !!game.settings.get(game.system.id, 'manualEntitySaving'),
            headerPanel: await this.customHeader?.render(
                this,
                (this.entity.sheet as foundry.applications.api.DocumentSheetV2.Any).isEditable
            ),
            bodyPanel: await this.customBody?.render(
                this,
                (this.entity.sheet as foundry.applications.api.DocumentSheetV2.Any).isEditable
            )
        };

        return extendedContext;
    }

    /**
     * @ignore
     * @override
     */
    getRollData(): AnyMutableObject {
        if (!TemplateSystem.isAppliedTemplateSystem(this)) return {};

        const rollData: AnyMutableObject = { ...this.system.props };

        rollData.name = this.entity.name;
        rollData.id = this.entity.id;
        rollData.uuid = this.entity.uuid;
        rollData.img = this.entity.img;

        return rollData;
    }

    /**
     * Rolls a template's defined roll with this Character properties
     * @param rollKey The key of the Component holding the roll
     * @param options Roll options
     * @returns The computed roll
     * @throws {Error} If the key does not have a roll
     */
    async roll(rollKey: string, options: RollOptions = {}): Promise<ComputablePhrase> {
        const { postMessage, alternative = false } = options;
        const error = new Error(`Label Roll Message with the key "${rollKey}" not found in Entity`);

        const refRoll = rollKey.split('.');
        const [filterMatch, parentProp, filterProp, filterValue] =
            refRoll.shift()?.match(/^([a-zA-Z0-9_]+)\((@?[a-zA-Z0-9_]+)=(.+)\)$/) ?? [];

        let item,
            reference = rollKey;
        if (filterMatch) {
            const parent = foundry.utils.getProperty(this.entity.getRollData(), parentProp) as Record<
                string,
                Record<string, Primitive>
            >;

            if (!parent) {
                throw error;
            }

            let index;
            if (filterProp === '@rowId') {
                index = filterValue;
                item = (this.entity.items as Collection<CustomItem>).get(index);
            } else {
                index = Object.keys(parent).filter((key) => parent[key][filterProp] === filterValue)[0];
            }

            if (!index) {
                throw error;
            }

            rollKey = `${parentProp}.${index}.${refRoll.join('.')}`;
            reference = `${parentProp}.${index}`;
        }

        const rollType = alternative ? 'alternative' : 'main';

        const renderOptions: ComponentRenderOptions = {
            reference: reference,
            source: `TemplateSystem#roll('${rollKey}', '${rollType}')`
        };

        if (CustomItem.isEquippableItem(item)) {
            renderOptions.linkedEntity = item;

            renderOptions.customProps = {
                item: { ...item.getRollData(), name: item.name }
            };
        }

        // Recovering value from data
        const chatSenderFunction = this.getCustomRoll(`${rollKey}.${rollType}`, renderOptions);

        if (!chatSenderFunction || typeof chatSenderFunction !== 'function') {
            throw error;
        }

        return chatSenderFunction(postMessage);
    }

    /**
     * Gets all custom rolls defined in the character's template
     * @returns All the functions triggering the rolls, in an object organizing them by keys
     */
    getCustomRoll(rollKey: string, options: ComponentRenderOptions): SendToChatFunction | undefined {
        if (Object.keys(this.componentMap).length === 0) {
            this.prepareData();
        }

        const splitRollKey = rollKey.split('.');
        const rollComponent = this.componentMap[splitRollKey[0]];
        if (!isChatSenderElement(rollComponent)) {
            return undefined;
        }

        const allRolls = TemplateSystem.isAppliedTemplateSystem(this)
            ? rollComponent.getSendToChatFunctions(this, options)
            : undefined;

        if (!allRolls) {
            return undefined;
        }

        const chatSenderFunction = foundry.utils.getProperty(allRolls, `${rollKey}`) as SendToChatFunction;

        return chatSenderFunction;
    }

    /**
     * Go through the template to get every keyed component in a flat object
     * @returns A flat map of keyed components
     */
    private _getComponentMap(): Record<string, Component> {
        const componentMap: Record<string, Component> = {};

        for (const rootComponent of [this.customHeader, this.customBody]) {
            if (rootComponent) {
                foundry.utils.mergeObject(componentMap, rootComponent.getComponentMap());
            }
        }

        return componentMap;
    }

    public getComputables(): Array<ComputableElement> {
        const computables = Object.values(this.componentMap).reduce((res: Array<ComputableElement>, component) => {
            if (isComputableElement(component)) {
                res.push(component);
            }
            return res;
        }, []);

        for (const hidden of this.system.hidden ?? []) {
            computables.push(new SimpleComputableElement(hidden.name, hidden.value));
        }

        return computables;
    }

    private _getProperties(): Array<string> {
        const properties = [];

        for (const rootComponent of [this.customHeader, this.customBody]) {
            if (rootComponent) {
                properties.push(...rootComponent.getProperties());
            }
        }

        return properties;
    }

    /**
     * Gets all keys in template, in a set
     * @return The set of keys
     */
    getKeys(): Set<string> {
        const keys = new Set(Object.keys(this.componentMap));

        this.system.hidden?.forEach((hidden) => {
            keys.add(hidden.name);
        });

        // Adding special key 'name', used by the field on top of the sheets.
        keys.add('name');
        keys.delete('');

        return keys;
    }

    /**
     * Sets the default values for all components in the template to the provided entity, and erases unknown properties from the entity
     */
    setDefaultValues(entityTemplateSystem: AppliedTemplateSystem): void {
        Object.values(this.componentMap).forEach((component) => {
            component.setDefaultValue(entityTemplateSystem);
        });

        const templatePropertySet = new Set(this._getProperties());
        const entityPropertySet = new Set(
            Object.keys(entityTemplateSystem.entity.system.props).map((prop) => {
                if (prop.startsWith('==') || prop.startsWith('-=')) {
                    return prop.substring(2);
                }

                return prop;
            })
        );

        entityPropertySet.forEach((prop) => {
            if (!templatePropertySet.has(prop)) {
                delete entityTemplateSystem.entity.system.props[prop];
                entityTemplateSystem.entity.system.props[prop] = undefined;
            }
        });
    }

    getSortedActiveEffects(includeDisabled: boolean = false): Record<
        string,
        Array<{
            activeEffect: CustomActiveEffect;
            change: ActiveEffect.ChangeData & { effect: CustomActiveEffect };
        }>
    > {
        const activeEffectsByKey: Record<
            string,
            Array<{
                activeEffect: CustomActiveEffect;
                change: ActiveEffect.ChangeData & { effect: CustomActiveEffect };
            }>
        > = {};

        // Organize non-disabled effects by their application priority
        for (const effect of this.entity.allApplicableEffects({
            excludeExternal: false,
            excludeTransfer: true
        })) {
            if (!includeDisabled && !effect.active) continue;
            effect.system.changes.forEach((change) => {
                try {
                    const c = {
                        ...foundry.utils.deepClone(change),
                        key: change.key,
                        effect: effect,
                        priority: change.priority ?? ActiveEffect.CHANGE_TYPES[change.type]?.defaultPriority ?? 0
                    };

                    const sortingKey = c.key.startsWith('system.props.')
                        ? c.key.substring(13)
                        : c.key.startsWith('target.')
                          ? c.key.substring(7)
                          : c.key;

                    if (!activeEffectsByKey[sortingKey]) {
                        activeEffectsByKey[sortingKey] = [];
                    }

                    activeEffectsByKey[sortingKey].push({ activeEffect: effect, change: c });
                } catch (err) {
                    Logger.error(
                        `Error when computing active effet key ${effect.name} - ${change.key} for actor ${this.entity.name}`,
                        err
                    );
                }
            });
        }

        for (const key in activeEffectsByKey) {
            activeEffectsByKey[key].sort((a, b) => (a.change.priority ?? 0) - (b.change.priority ?? 0));
        }

        return activeEffectsByKey;
    }

    /**
     * Reloads this entity's templates, updating the component structure, and re-renders the sheet.
     * @param templateId New template id. If not set, will reload the current template.
     */
    async reloadTemplate(templateId?: string) {
        if (!TemplateSystem.isAppliedTemplateSystem(this)) {
            return;
        }

        const entityCollection = getGameCollection(this.entityType);

        templateId = templateId || this.entity.system.template;

        if (!templateId) {
            throw new Error(`Trying to reload entity without template: ${this.entity.uuid} - ${this.entity.name}`);
        }

        const template = entityCollection.get(templateId) as
            | CustomActor<'_template'>
            | CustomItem<'_equippableItemTemplate'>;

        if (!template) {
            throw new Error(
                `Trying to reload entity with undefined template: ${templateId} - ${this.entity.uuid} - ${this.entity.name}`
            );
        }

        let attributeBars: SchemaField.UpdateData<TemplateActorDataModelSchema>['attributeBar'];

        if (CustomActor.isTemplateActor(template) && CustomActor.isCharacterActor(this.entity)) {
            attributeBars = { ...template.system.attributeBar };

            for (const barName in this.entity.system.attributeBar) {
                if (!attributeBars[barName]) {
                    // @ts-expect-error Outdated types
                    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access @typescript-eslint/no-unsafe-call
                    attributeBars[barName] = new foundry.data.operators.ForcedDeletion();
                }
            }
        }

        template.templateSystem.setDefaultValues(this);

        (this.entity.sheet as CharacterSheet | EquippableItemSheet).hasBeenRenderedOnce = false;

        this.customBody = undefined;
        this.customHeader = undefined;

        // Updates hidden properties, tabs & header data
        // Sheet rendering will handle the actual props creation
        await this.entity.update({
            system: {
                templateSystemUniqueVersion: template.system.templateSystemUniqueVersion,
                template: templateId,
                hidden: template.system.hidden,
                body: template.system.body,
                header: template.system.header,
                initiativeFormula: CustomActor.isTemplateActor(template)
                    ? template.system.initiativeFormula
                    : undefined,
                display: template.system.display,
                attributeBar: CustomActor.isTemplateActor(template) ? template.system.attributeBar : undefined,
                props: this.entity.system.props
            }
        });

        const effectsToCreate: Array<ActiveEffect.CreateData> = [];
        const effectsToUpdate: Array<ActiveEffect.UpdateData> = [];
        const effectsToDelete: Array<string> = [];
        template.effects.forEach((effect) => {
            const existingEffect = (this.entity.effects as Collection<CustomActiveEffect>).find(
                (existingEffect: CustomActiveEffect) => {
                    return existingEffect.getFlag(game.system.id, 'originalUuid') === effect.uuid;
                }
            );
            if (existingEffect) {
                effectsToUpdate.push({ ...effect.toJSON(), _id: existingEffect.id });
            } else {
                effectsToCreate.push(effect.toJSON());
            }
        });

        this.entity.effects.forEach((existingEffect) => {
            if (
                existingEffect.getFlag(game.system.id, 'isFromTemplate') &&
                existingEffect.getFlag(game.system.id, 'originalParentId') !== template.id
            ) {
                effectsToDelete.push(existingEffect.id);
            }

            if (existingEffect.getFlag(game.system.id, 'originalParentId') === template.id) {
                if (!template.effects.has(existingEffect.getFlag(game.system.id, 'originalId') as string)) {
                    effectsToDelete.push(existingEffect.id);
                }
            }
        });

        // Cheating with types because TS whines otherwise
        await Promise.allSettled([
            (this.entity as Actor).updateEmbeddedDocuments('ActiveEffect', effectsToUpdate),
            (this.entity as Actor).createEmbeddedDocuments('ActiveEffect', effectsToCreate),
            (this.entity as Actor).deleteEmbeddedDocuments('ActiveEffect', effectsToDelete)
        ]);

        Logger.debug('Updated !');
        this.entity.render(false);
    }

    /**
     * Saves template data, updates templateSystemUniqueVersion and handles history generation
     */
    async saveTemplate() {
        const history = this.addSnapshotHistory();

        await this.entity.update({
            system: {
                header: this.customHeader?.toJSON(),
                body: this.customBody?.toJSON(),
                templateSystemUniqueVersion: (Math.random() * 0x100000000) >>> 0
            },
            flags: {
                [game.system.id]: {
                    templateHistory: JSON.stringify(history),
                    templateHistoryRedo: '[]'
                }
            }
        });

        this.entity.render(false);
    }

    /**
     * Throws an UncomputableError. This can be used in custom-scripts of Users, where the Script depends on computable
     * properties, which are potentially undefined in the current computation cycle.
     *
     * @param message The error message, which will be displayed in the console, if the computation fails after multiple attempts
     * @param source The source of the error. This should be a path of where the error happened (e.g. dynamicTableKey.columnKey). This will only be used for debugging
     *
     * @deprecated
     */
    throwUncomputableError(message: string, source: string = ''): void {
        Logger.warn('Deprecated, please call throwUncomputableError directly');
        throw new UncomputableError(message, source, '(Script-Expression)', this.entity.getRollData());
    }

    /**
     * Adds a new snapshot to the history, computing it if necessary
     * @param diff The diff to add, if already computed
     * @returns The full history
     */
    addSnapshotHistory(diff?: Array<JSONObject>): Array<Array<JSONObject>> {
        if (!diff) {
            diff = DeepDiff.diff(
                {
                    header: this.entity.system.header as JSONObject,
                    body: this.entity.system.body as JSONObject
                },
                {
                    header: this.customHeader?.toJSON(),
                    body: this.customBody?.toJSON()
                }
            );
        }

        let history = this._getHistory();
        history.push(diff);
        history = history.slice(-10);

        return history;
    }

    /**
     * Adds a new snapshot to the redo-history
     * @param diff The diff to add
     * @returns The full redo-history
     */
    addSnapshotHistoryRedo(diff: Array<JSONObject>): Array<Array<JSONObject>> {
        let redoHistory = this._getHistoryRedo();
        redoHistory.push(diff);
        redoHistory = redoHistory.slice(-10);

        return redoHistory;
    }

    /**
     * Undoes the latest diff in history
     */
    async undoHistory() {
        const history = this._getHistory();
        const diff = history.pop();

        if (diff) {
            const redoHistory = this.addSnapshotHistoryRedo(diff);

            const state = {
                header: this.entity.system.header as JSONObject,
                body: this.entity.system.body as JSONObject
            };

            for (const aDiff of diff) {
                DeepDiff.revertChange(state, {}, aDiff);
            }

            this.customHeader = undefined;
            this.customBody = undefined;

            await this.entity.update({
                flags: {
                    [game.system.id]: {
                        templateHistory: JSON.stringify(history),
                        templateHistoryRedo: JSON.stringify(redoHistory)
                    }
                },
                system: {
                    header: state.header,
                    body: state.body,
                    templateSystemUniqueVersion: (Math.random() * 0x100000000) >>> 0
                }
            });

            this.entity.render(false);
        }
    }

    /**
     * Redoes the latest diff in redo-history
     */
    async redoHistory() {
        const redoHistory = this._getHistoryRedo();
        const diff = redoHistory.pop();

        if (diff) {
            const history = this.addSnapshotHistory(diff);

            const state = {
                header: this.entity.system.header as JSONObject,
                body: this.entity.system.body as JSONObject
            };

            for (const aDiff of diff) {
                DeepDiff.applyChange(state, {}, aDiff);
            }

            this.customHeader = undefined;
            this.customBody = undefined;

            await this.entity.update({
                flags: {
                    [game.system.id]: {
                        templateHistory: JSON.stringify(history),
                        templateHistoryRedo: JSON.stringify(redoHistory)
                    }
                },
                system: {
                    header: state.header,
                    body: state.body,
                    templateSystemUniqueVersion: (Math.random() * 0x100000000) >>> 0
                }
            });

            this.entity.render(false);
        }
    }

    /**
     * @returns The template's history
     */
    private _getHistory(): Array<Array<JSONObject>> {
        try {
            return (
                // Cheating with types because TS whines otherwise
                JSON.parse(
                    ((this.entity as CustomActor).getFlag(game.system.id, 'templateHistory') as string) ?? '[]'
                ) as Array<Array<JSONObject>>
            );
        } catch (_err) {
            return [];
        }
    }

    /**
     * @returns The template's redo-history
     */
    private _getHistoryRedo(): Array<Array<JSONObject>> {
        try {
            return (
                // Cheating with types because TS whines otherwise
                JSON.parse(
                    ((this.entity as CustomActor).getFlag(game.system.id, 'templateHistoryRedo') as string) ?? '[]'
                ) as Array<Array<JSONObject>>
            );
        } catch (_err) {
            return [];
        }
    }

    /**
     * Handles the sheet submit to either save now or wait a delay if activated in system settings
     */
    async handleSheetSubmit() {
        this.isModified = true;

        if (this.entity.sheet) {
            $(this.entity.sheet.element)
                .find('.custom-system-save-entity')
                .removeClass('custom-system-button-inactive');
        }

        return {};
    }

    async forceSubmitSheet() {
        this.isModified = false;

        return (
            this.entity.sheet! as unknown as
                | CustomActorSheet
                | EquippableItemSheet
                | SubTemplateItemSheet
                | UserInputTemplateItemSheet
        )?.submit();
    }

    public async configureAttributes(): Promise<void> {
        void new HiddenAttributesDialog(this.entity).render({ force: true });
    }

    public async editAttributeBars(): Promise<void> {
        if (CustomActor.isTemplateActor(this.entity)) {
            void new AttributeBarsDialog(this.entity).render({ force: true });
        }
    }

    public async editTemplateSettings(): Promise<void> {
        if (CustomActor.isTemplateActor(this.entity) || CustomItem.isEquippableItemTemplate(this.entity)) {
            void new TemplateSettingsDialog(this.entity).render({ force: true });
        }
    }

    public async reloadAllSheets(): Promise<void> {
        void new ReloadTemplatesDialog(this.entity).render({ force: true });
    }

    private async reloadSheetTemplate(ev: JQuery.ClickEvent): Promise<void> {
        if (game.user?.hasRole(game.settings.get(game.system.id, 'minimumRoleTemplateReloading') as CONST.USER_ROLES)) {
            const target = $(ev.currentTarget);
            const templateId = target
                .parents('.custom-system-template-select')
                .find(`#template-${this.entity.id}`)
                .val();

            return this.reloadTemplate(String(templateId));
        }
    }

    private openTemplate(ev: JQuery.ClickEvent): void {
        const target = $(ev.currentTarget);
        const templateId = target.parents('.custom-system-template-select').find(`#template-${this.entity.id}`).val();

        if (templateId) {
            // oxlint-disable-next-line @typescript-eslint/no-deprecated
            void getGameCollection(this.entityType).get(String(templateId))?.sheet?.render(true);
        }
    }

    /**
     * Activate listeners on the sheets
     *
     * @param html The sheet HTML to activate the listeners
     */
    activateListeners(html: JQuery<HTMLElement>) {
        // -------------------------------------------------------------
        // Everything below here is only needed if the sheet is editable
        if (!(this.entity.sheet as foundry.applications.api.DocumentSheetV2.Any)?.isEditable) return;

        if (TemplateSystem.isBuilderTemplateSystem(this)) {
            // Undo button
            html.find('.custom-system-undo').on('click', (_ev) => {
                void this.undoHistory();
            });

            if (this._getHistory().length === 0) {
                // DEPRECATED To remove after sheetv1 are deleted
                html.find('.custom-system-undo').prop('disabled', 'disabled');
                html.find('.custom-system-undo').addClass('custom-system-button-inactive');
            }

            // Redo button
            html.find('.custom-system-redo').on('click', (_ev) => {
                void this.redoHistory();
            });

            if (this._getHistoryRedo().length === 0) {
                // DEPRECATED To remove after sheetv1 are deleted
                html.find('.custom-system-redo').prop('disabled', 'disabled');
                html.find('.custom-system-redo').addClass('custom-system-button-inactive');
            }

            // Edit hidden attributes
            html.find('.custom-system-configure-attributes').on('click', (_ev) => {
                void this.configureAttributes();
            });

            // Edit attribute bars
            html.find('.custom-system-configure-attribute-bars').on('click', (_ev) => {
                void this.editAttributeBars();
            });

            // Edit display settings
            html.find('.custom-system-configure-display').on('click', (_ev) => {
                void this.editTemplateSettings();
            });

            // Reload all sheets
            html.find('.custom-system-reload-all-sheets').on('click', (_ev) => {
                void this.reloadAllSheets();
            });

            html.on('dragenter', () => {
                html.find('.custom-system-droppable-container').addClass('custom-system-template-dragged-eligible');
                html.find('.custom-system-component-root').addClass('custom-system-template-dragged-eligible');
            });

            $(document).on('dragend', () => {
                $('.custom-system-template-dragged-eligible').removeClass(
                    'custom-system-template-dragged-eligible custom-system-template-dragged-over'
                );
            });
        } else {
            html.find('.custom-system-template-select .custom-system-reload-template').on('click', (ev) => {
                void this.reloadSheetTemplate(ev);
            });
            html.find('.custom-system-template-select .custom-system-open-template').on('click', (ev) =>
                this.openTemplate(ev)
            );

            // See hidden attributes values
            html.find('.custom-system-see-attributes').on('click', (_ev) => {
                void this.openAttributesVision();
            });

            // See hidden attribute-bars values
            html.find('.custom-system-see-attribute-bars').on('click', (_ev) => {
                void this.openAttributeBarsVision();
            });

            html.find('.custom-system-save-entity').on('click', (_ev) => {
                void this.forceSubmitSheet();
            });
        }
    }

    async openAttributesVision() {
        const attributes = [];

        for (const hiddenAttr of (this.entity.system as CharacterActorDataModel).hidden) {
            attributes.push({
                name: hiddenAttr.name,
                value: (this.entity.system as CharacterActorDataModel).props[hiddenAttr.name]
            });
        }

        const content = await foundry.applications.handlebars.renderTemplate(
            `systems/${game.system.id}/templates/_template/dialogs/readAttributes.hbs`,
            {
                attributes
            }
        );

        await new CustomDialogV2({
            window: { title: game.i18n.localize('CSB.Attributes.HiddenAttributesDialog.Title') },
            content,
            buttons: {
                ok: {
                    label: game.i18n.localize('Close')
                }
            },
            position: {
                width: 'auto',
                height: 'auto'
            }
        }).render({ force: true });
    }

    async openAttributeBarsVision() {
        const attributeBars = Object.values((this.entity.system as CharacterActorDataModel).attributeBar);

        const content = await foundry.applications.handlebars.renderTemplate(
            `systems/${game.system.id}/templates/_template/dialogs/readAttributeBars.hbs`,
            {
                attributeBars
            }
        );

        await new CustomDialogV2({
            content,
            buttons: {
                ok: {
                    label: game.i18n.localize('Close')
                }
            },
            position: {
                width: 'auto',
                height: 'auto'
            },
            window: {
                title: game.i18n.localize('CSB.Attributes.AttributeBarsDialog.Title')
            }
        }).render({ force: true });
    }
}

export default TemplateSystem;
