/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AnyObject } from 'fvtt-types/utils';

import { JSONObject, Primitive } from '../../definitions.js';
import CustomItem from '../../documents/CustomItem.js';
import TemplateSystem, { AppliedTemplateSystem, BuilderTemplateSystem } from '../../documents/TemplateSystem.js';
import { AlphanumericPatternError } from '../../errors/ComponentValidationError.js';
import Formula from '../../formulas/Formula.js';
import Logger from '../../Logger.js';
import type Container from './Container.js';
import { ComponentOptions } from './Container.js';

export type ChangeCallback = (
    e: JQuery.TriggeredEvent<HTMLElement, undefined, HTMLElement, HTMLElement> | Event,
    key: string,
    value: Primitive
) => void | Promise<void>;

export type ComponentRenderOptions = {
    /** The source of the computation. Used for debugging only */
    source?: string;

    /** The reference of the computation. This is needed if you want to use functions like 'sameRow()' within a row */
    reference?: string;

    /** Additional properties for computation. This can override standard props if the same key is used */
    customProps?: AnyObject;

    /** Additional entity used in the computation. Currently used in Item Container computations */
    linkedEntity?: CustomItem;

    /** Optional callback trigerred when the field value is changed */
    changeCallback?: ChangeCallback;

    /** Should be true to prevent the "name" attribute to be set on the component */
    noName?: boolean;
};

/**
 * Component properties
 */
export type ComponentProps = {
    /** Component key */
    key?: string;
    /** Component tooltip */
    tooltip?: string;
    /** Component address in template, i.e. component path from entity.system object */
    templateAddress: string;
    /** Component column spanning */
    colSpan?: number;
    /** Component row spanning */
    rowSpan?: number;
    /** Additional CSS class to apply at render */
    cssClass?: string;
    /** Minimum role to see the component */
    role?: CONST.USER_ROLES;
    /** Minimum role to edit the component */
    editRole?: CONST.USER_ROLES;
    /** Minimum permission on the entity to see the component */
    permission?: CONST.DOCUMENT_OWNERSHIP_LEVELS;
    /** Component visibility formula */
    visibilityFormula?: string;
    /** Component editable formula */
    editableFormula?: string;
    /** Escape HTML in templates ? */
    escapeHTML?: boolean;
    /** Component's container */
    parent?: Container;
};

/**
 * JSON version of a Component
 */
export type ComponentJson = {
    /** Component key */
    key?: string;
    /** Component column spanning */
    colSpan?: number;
    /** Component row spanning */
    rowSpan?: number;
    /** Additional CSS class to apply at render */
    cssClass?: string;
    /** Minimum role to see the component */
    role?: CONST.USER_ROLES;
    /** Minimum role to edit the component */
    editRole?: CONST.USER_ROLES;
    /** Minimum permission on the entity to see the component */
    permission?: CONST.DOCUMENT_OWNERSHIP_LEVELS;
    /** Component tooltip */
    tooltip?: string;
    /** Component visibility formula */
    visibilityFormula?: string;
    /** Component editable formula*/
    editableFormula?: string;
    /** Escape HTML in templates ? */
    escapeHTML?: boolean;
    /** Component type code */
    type: string;
};

export type ComponentValueType = 'none' | 'string' | 'number' | 'boolean';

export type ComponentConfigFormData = Record<string, unknown>;

/**
 * Abstract component class
 * @abstract
 */
export default abstract class Component {
    /**
     * The value type of this component. This is used to display an input field in the Dynamic Table's templates
     * This should be 'none' | 'string' | 'number' | 'boolean'
     */
    static readonly valueType: ComponentValueType = 'none';

    /**
     * Should this component type be included by default in component creation windows ?
     * If false, component must be explicitly required when opening the dialog
     */
    static readonly publicComponent: boolean = true;

    /**
     * Component key
     */
    protected _key?: string;

    /**
     * Component address in template definition
     */
    protected _templateAddress: string;

    /**
     * Component column spanning
     */
    protected _colSpan: number;

    /**
     *  Component row spanning
     */
    protected _rowSpan: number;

    /**
     * Component css class
     */
    protected _cssClass: string;

    /**
     * Component minimum role to be visible
     */
    protected _role: CONST.USER_ROLES;

    /**
     * Component minimum role to be editable
     */
    protected _editRole: CONST.USER_ROLES;

    /**
     * Component minimum permission to be visible
     */
    protected _permission: CONST.DOCUMENT_OWNERSHIP_LEVELS;

    /**
     * Component tooltip
     */
    protected _tooltip: string;

    /**
     * Component visibility formula
     */
    protected _visibilityFormula: string;

    /**
     * Component editable formula
     */
    protected _editableFormula: string;

    /**
     * Escape HTML in templates ?
     */
    protected _escapeHTML: boolean;

    /**
     * Composant parent
     * @type {Container}
     */
    protected _parent?: Container;

    /**
     * Should be true if the template version should show a wrapper, as is made for templates
     */
    static readonly addWrapperOnTemplate: boolean = false;

    /**
     * Should be true if the component is draggable to be copied
     */
    static readonly draggable: boolean = true;

    /**
     * Component constructor
     * @constructor
     * @param componentProps Component properties
     */
    constructor({
        key,
        templateAddress,
        colSpan,
        rowSpan,
        cssClass = '',
        role = CONST.USER_ROLES.NONE,
        permission = CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
        editRole = CONST.USER_ROLES.NONE,
        tooltip = '',
        visibilityFormula = '',
        editableFormula = '',
        escapeHTML = false,
        parent
    }: ComponentProps) {
        if (this.constructor === Component) {
            throw new TypeError('Abstract class "Component" cannot be instantiated directly');
        }
        this._key = key;
        this._templateAddress = templateAddress;
        this._colSpan = colSpan ?? 1;
        this._rowSpan = rowSpan ?? 1;
        this._cssClass = cssClass;
        this._role = role;
        this._permission = permission;
        this._editRole = editRole;
        this._tooltip = tooltip;
        this._visibilityFormula = visibilityFormula;
        this._editableFormula = editableFormula;
        this._escapeHTML = escapeHTML;
        this._parent = parent;
    }

    /**
     * Component key
     */
    get key(): string | undefined {
        return this._key;
    }

    /**
     * Component property key
     */
    get propertyKey(): string | undefined {
        return undefined;
    }

    /**
     * Component tooltip
     */
    get tooltip(): string {
        return this._tooltip;
    }

    /**
     * Component address in template, i.e. component path from entity.system object
     */
    get templateAddress(): string {
        return this._templateAddress;
    }

    /**
     * Component column spanning
     */
    get colSpan(): number {
        return this._colSpan;
    }

    /**
     *  Component row spanning
     */
    get rowSpan(): number {
        return this._rowSpan;
    }

    /**
     * Additional CSS class
     */
    get cssClass(): string {
        return this._cssClass;
    }

    /**
     * Component minimum role to be visible
     */
    get role(): CONST.USER_ROLES {
        return this._role;
    }

    /**
     * Component minimum role to be editable
     */
    get editRole(): CONST.USER_ROLES {
        return this._editRole;
    }

    /**
     * Component minimum permission to be visible
     */
    get permission(): CONST.DOCUMENT_OWNERSHIP_LEVELS {
        return this._permission;
    }

    /**
     * Component raw visibility formula
     */
    get visibilityFormula(): string {
        return this._visibilityFormula;
    }

    /**
     * Component raw editable formula
     */
    get editableFormula(): string {
        return this._editableFormula;
    }

    /**
     * Escape HTML in templates ?
     */
    get escapeHTML(): boolean {
        return this._escapeHTML;
    }

    /**
     * Component should have header on template mode
     * @returns {boolean}
     */
    get addWrapperOnTemplate(): boolean {
        return (this.constructor as typeof Component).addWrapperOnTemplate;
    }

    /**
     * Component is draggable
     */
    get draggable(): boolean {
        return (this.constructor as typeof Component).draggable;
    }

    /**
     * Returns component's parent
     */
    get parent(): Container | undefined {
        return this._parent;
    }

    /**
     * Check if component can be rendered for the current user
     * @param entity The Template System used to render the component
     * @param options Options to compute the visibility formula
     * @returns `true` if the component can be rendered, `false` otherwise
     */
    canBeRendered(entity: TemplateSystem, options: ComponentRenderOptions = {}): boolean {
        if (TemplateSystem.isBuilderTemplateSystem(entity)) {
            return true;
        }

        let canRender = game.user.role >= this.role && (entity.entity.permission ?? 0) >= this.permission;

        if (this.visibilityFormula) {
            const formula = new Formula(this.visibilityFormula);

            try {
                const formulaProps = {
                    ...entity.system?.props,
                    ...options.customProps
                };

                formula.computeStatic(formulaProps, {
                    ...options,
                    source: `${this.key}.visibilityFormula`,
                    triggerEntity: entity,
                    reference: options.reference
                });

                canRender = canRender && !!formula.result; // Cast to boolean
            } catch (_e) {
                canRender = false;
            }
        }

        return canRender;
    }

    canBeEdited(entity: TemplateSystem, options: ComponentRenderOptions = {}): boolean {
        let canEdit = game.user.role >= this.editRole;

        if (this.editableFormula) {
            const formula = new Formula(this.editableFormula);

            try {
                const formulaProps = {
                    ...entity.system?.props,
                    ...options.customProps
                };

                formula.computeStatic(formulaProps, {
                    ...options,
                    source: `${this.key}.editableFormula`,
                    triggerEntity: entity,
                    reference: options.reference
                });

                canEdit = canEdit && !!formula.result; // Cast to boolean
            } catch (_e) {
                canEdit = false;
            }
        }

        return canEdit;
    }

    /**
     * Handles the component rendering, including checking if component can be rendered.
     * This function should not be overriden, instead override the _getElement function to actually render your component.
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user ?
     * @param options Additional options usable by the final Component
     * @return The jQuery element holding the component
     */
    async render(
        entity: TemplateSystem,
        isEditable: boolean = true,
        options: ComponentRenderOptions = {}
    ): Promise<JQuery> {
        const element = await this._getElement(entity, isEditable && this.canBeEdited(entity, options), {
            ...options,
            customProps: {
                ...options.customProps,
                this:
                    this.key && TemplateSystem.isAppliedTemplateSystem(entity)
                        ? foundry.utils.getProperty(entity.getRollData(), this.key)
                        : null
            }
        });

        return this.canBeRendered(entity, options) ? element : $('<div style="display: none"></div>').append(element);
    }

    /**
     * Actual function which renders the component.
     * @abstract
     * @param entity Rendered entity (actor or item)
     * @param _isEditable Is the component editable by the current user ?
     * @param options Additional options usable by the final Component
     * @return The jQuery element holding the component
     */
    protected async _getElement(
        entity: TemplateSystem,
        _isEditable: boolean = true,
        options: ComponentRenderOptions = {}
    ): Promise<JQuery> {
        let jQElement = $('<div></div>');
        jQElement.addClass('custom-system-component-contents');
        jQElement.addClass(this.key ?? '');
        jQElement.attr('data-key', this.key ?? '');

        if (this.tooltip) {
            let tooltipText = this.tooltip;
            if (TemplateSystem.isAppliedTemplateSystem(entity)) {
                try {
                    tooltipText =
                        (
                            await ComputablePhrase.computeMessage(
                                this.tooltip,
                                {
                                    ...entity.getRollData(),
                                    ...options.customProps
                                },
                                {
                                    ...options,
                                    source: `${this.key}.tooltip`,
                                    triggerEntity: entity,
                                    reference: options.reference
                                }
                            )
                        ).result ?? 'ERROR';
                } catch (err) {
                    Logger.error((err as Error).message, err);
                    tooltipText = 'ERROR';
                }
            }

            jQElement.attr('data-tooltip', tooltipText);
        }

        if (TemplateSystem.isBuilderTemplateSystem(entity)) {
            if (this.templateAddress !== 'body' && this.templateAddress !== 'header') {
                let dragHandle = jQElement;

                if (this.addWrapperOnTemplate) {
                    const templateWrapper = $('<div></div>');
                    templateWrapper.addClass('custom-system-editable-panel flexcol');

                    const panelTitle = $('<div></div>');
                    panelTitle.addClass('custom-system-editable-panel-title custom-system-editable-component');

                    if (this.key) {
                        panelTitle.addClass(`custom-system-edit-${this.key}`);
                    }

                    panelTitle.text(
                        `${(this.constructor as typeof Component).getPrettyName()}${this.key ? ` ${this.key}` : ''}`
                    );

                    panelTitle.on('click', () => {
                        this.editComponent(entity);
                    });

                    templateWrapper.append(panelTitle);
                    templateWrapper.append(jQElement);

                    jQElement = templateWrapper;
                    dragHandle = panelTitle;
                }

                if (this.draggable) {
                    this._handleDragEvents(entity, jQElement, dragHandle);
                }
            }
        }

        let cssClass = this.cssClass;
        if (cssClass && TemplateSystem.isAppliedTemplateSystem(entity)) {
            try {
                cssClass =
                    (
                        await ComputablePhrase.computeMessage(
                            cssClass,
                            {
                                ...entity.getRollData(),
                                ...options.customProps
                            },
                            {
                                ...options,
                                source: `${this.key}.css`,
                                triggerEntity: entity,
                                reference: options.reference
                            }
                        )
                    ).result ?? 'ERROR';
            } catch (err) {
                Logger.error((err as Error).message, err);
                cssClass = 'ERROR';
            }
        }

        jQElement.addClass(cssClass);
        jQElement.addClass('custom-system-component-root');
        jQElement.addClass(`grid-span-${this.colSpan}`);
        jQElement.addClass(`grid-row-span-${this.rowSpan}`);

        return jQElement;
    }

    /**
     * Go through the component to get every keyed component in a flat object
     * @returns A flat map of keyed components
     */
    getComponentMap(): Record<string, Component> {
        const componentMap: Record<string, Component> = {};

        if (this.key && this.key !== '') {
            componentMap[this.key] = this;
        }

        return componentMap;
    }

    /**
     * Go through the contents to get every property name in a flat array
     * @override
     */
    getProperties(): Array<string> {
        const properties = [];

        if (this.propertyKey) {
            properties.push(this.propertyKey);
        }

        return properties;
    }

    /**
     * Sets default values in the entity, if no value exists for the component
     * @param _entity The entity to set the value into
     * @returns The value of the component, either the default or the preexisting one
     */
    setDefaultValue(_entity: AppliedTemplateSystem, _options: ComponentRenderOptions = {}): void {}

    /**
     * Handles drag & drop events for Components
     * @param entity Rendered entity (actor or item)
     * @param jQElement The JQuery element being dragged
     * @param dragHandle The JQuery element acting as the handle. This can be part of the jQElement or be the jQElement itself
     */
    protected _handleDragEvents(
        entity: TemplateSystem,
        jQElement: JQuery<HTMLElement>,
        dragHandle: JQuery<HTMLElement>
    ) {
        dragHandle.attr('draggable', 'true');
        dragHandle.on('dragstart', (ev) => {
            if (ev.originalEvent) {
                ev.originalEvent.stopPropagation();
                if (ev.originalEvent.dataTransfer) {
                    ev.originalEvent.dataTransfer.effectAllowed = 'copyMove';
                    ev.originalEvent.dataTransfer.dropEffect = 'move';
                }
            }

            globalThis.copiedComponent = {
                sourceId: entity.uuid!,
                component: this
            };

            setTimeout(() => {
                jQElement.hide();
            }, 0);
        });
        dragHandle.on('dragend', () => {
            $('.custom-system-drop-target').remove();
            entity.render(false);
        });

        if ((this.parent?.constructor as typeof Container)?.droppable) {
            dragHandle.on('dragover', (ev) => {
                this.dragOverComponent(entity, ev);
            });

            dragHandle.on('dragenter', (ev) => {
                ev.stopPropagation();
                ev.preventDefault();

                $('.custom-system-drop-target').remove();

                const dropTarget = $('<div>Insert here</div>');
                dropTarget.addClass('custom-system-drop-target');

                dropTarget.on('dragover', (ev) => {
                    this.dragOverComponent(entity, ev);
                });

                dropTarget.on('dragleave', () => {
                    $('.custom-system-drop-target').remove();
                });
                dropTarget.on('drop', (event) => {
                    void this.dropOnComponent(entity, event, this.parent!, {
                        insertBefore: this
                    });
                });

                dropTarget.insertBefore(jQElement);
            });

            dragHandle.on('drop', (event) => {
                void this.dropOnComponent(entity, event, this.parent!, {
                    insertBefore: this
                });
            });
        }
    }

    /**
     * Handles component editor dialog
     * @param entity Template containing the component
     * @param additionalAttributes Additional attributes. Currently used for extensibleTables, like the column name
     * @param allowedComponents Allowed components to replace this component with
     */
    editComponent(entity: BuilderTemplateSystem, additionalAttributes?: JSONObject, allowedComponents?: Array<string>) {
        void this.parent?.openComponentEditor(entity, { allowedComponents, additionalAttributes }, this);
    }

    /**
     * Saves component in database
     * @param entity Template containing the component
     */
    async save(entity: TemplateSystem) {
        await entity.saveTemplate();
    }

    /**
     * Updates component with the data from the edition popup
     * @param entity Template containing the component
     * @param data JSON data of the component to edit
     */
    public async update(entity: TemplateSystem, data: ComponentJson) {
        const newComponent = foundry.utils.mergeObject(this.toJSON(), data) as ComponentJson;

        this.parent!.replaceComponent(this, newComponent);

        // After actions have been taken care of, save entity
        await this.save(entity);
    }

    /**
     * Deletes component
     * @param entity Template containing the component
     * @param triggerSave Whether to save the template after deletion or not
     */
    public async delete(entity: TemplateSystem, triggerSave: boolean = true) {
        this.parent!.deleteComponent(this);
        if (triggerSave) {
            await this.save(entity);
        }
    }

    /**
     * Sort after in the same container
     * @param entity Template containing the component
     */
    async sortAfterInParent(entity: TemplateSystem) {
        this.parent!.sortComponentAfter(this);

        // After actions have been taken care of, save entity
        await this.save(entity);
    }

    /**
     * Sort before in the same container
     * @param entity Template containing the component
     */
    async sortBeforeInParent(entity: TemplateSystem) {
        this.parent!.sortComponentBefore(this);

        // After actions have been taken care of, save entity
        await this.save(entity);
    }

    /**
     * Handles the dragover event
     * @param entity Template containing the component
     * @param event The DragEvent
     */
    private dragOverComponent(entity: TemplateSystem, event: JQuery.DragOverEvent) {
        event.stopPropagation();
        event.preventDefault();

        const sourceId = globalThis.copiedComponent?.sourceId;

        if (event.originalEvent?.dataTransfer) {
            event.originalEvent.dataTransfer.dropEffect = event.ctrlKey || sourceId !== entity.uuid ? 'copy' : 'move';
        }
    }

    /**
     * Handles components and subtemplates drops on a component
     * @param entity Template containing the component
     * @param event The DropEvent
     * @param insertionTarget The target Container
     * @param insertionOptions Options to create the component
     */
    protected async dropOnComponent(
        entity: TemplateSystem,
        event: JQuery.DropEvent,
        insertionTarget: Container,
        insertionOptions: ComponentOptions
    ): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        let dropData;

        try {
            dropData = JSON.parse(event.originalEvent!.dataTransfer!.getData('text/plain')) as Item.DropData;
        } catch (_e) {
            // Nothing should happen
        }

        if (dropData) {
            try {
                const item = await Item.fromDropData(dropData);
                if (CustomItem.isSubTemplate(item)) {
                    try {
                        await insertionTarget.addNewComponent(
                            entity,
                            (item.system.body.contents as ComponentJson | ComponentJson[] | undefined) ?? [],
                            insertionOptions
                        );
                    } catch (e) {
                        ui.notifications.error((e as Error).message);
                    }
                } else {
                    ui.notifications.error(game.i18n.localize('CSB.UserMessages.WrongDragOnTemplate'));
                }
            } catch (_e) {
                // Nothing should happen
            }
        }

        const droppedData = globalThis.copiedComponent;
        const sourceId = droppedData?.sourceId;
        const droppedComponent = droppedData?.component;

        if (droppedComponent) {
            let isMovement = false;

            if (sourceId === entity.uuid && !event.ctrlKey && !event.metaKey) {
                await droppedComponent.delete(entity, false);
                isMovement = true;
            }

            try {
                await insertionTarget.addNewComponent(entity, droppedComponent.toJSON(), insertionOptions, isMovement);
                globalThis.copiedComponent = null;
            } catch (e) {
                ui.notifications.error((e as Error).message);
            }
        }
    }

    public recalculateAddresses(newAddress: string) {
        this._templateAddress = newAddress;
    }

    protected getSluggedId(entity: TemplateSystem): string {
        return `${entity.uuid}-${this.key}`.replace(/[. #]/g, '-');
    }

    /**
     * Returns serialized component
     * Should be overridden by each Component subclass
     * @returns The JSONified component
     */
    toJSON(): ComponentJson {
        return {
            key: this._key,
            colSpan: this.colSpan,
            rowSpan: this.rowSpan,
            cssClass: this.cssClass,
            role: this.role,
            editRole: this.editRole,
            permission: this.permission,
            tooltip: this.tooltip,
            visibilityFormula: this.visibilityFormula,
            editableFormula: this.editableFormula,
            escapeHTML: this.escapeHTML,
            type: (this.constructor as typeof Component).getTechnicalName()
        };
    }

    /**
     * Creates a new component from a JSON description
     * Should be implemented by each Component subclass
     * @abstract
     * @throws {Error} If not implemented
     * @returns The new Component
     */
    static fromJSON(_json: ComponentJson, _templateAddress: string, _parent?: Container): Component {
        throw new Error('You must implement this function');
    }

    /**
     * Gets technical name for this component's type
     * @return The technical name
     * @throws {Error} If not implemented
     */
    static getTechnicalName(): string {
        // V13 DEPRECATION WARNING
        Logger.warn(
            `static getTechnicalName was not implemented for Component Type ${this.constructor.name}. This will be mandatory for v5.0.0, with the Foundry 13 compatibility.`
        );
        return 'component';
    }

    /**
     * Gets pretty name for this component's type
     * Should be implemented by each Component subclass
     * @abstract
     * @throws {Error} If not implemented
     * @returns A pretty name for the component
     */
    static getPrettyName(): string {
        throw new Error(`Function not implemented : static getPrettyName(): string (in ${this.constructor.name}`);
    }

    /**
     * Get configuration form for component creation / edition
     * Should be implemented by each Component subclass
     * @abstract
     * @throws {Error} If not implemented
     * @returns A JQuery Element containing the form
     */
    static async getConfigForm(
        _entity: TemplateSystem,
        _appId: string,
        _existingComponent?: ComponentJson & JSONObject
    ): Promise<HTMLElement> {
        throw new Error('You must implement this function');
    }

    /**
     * Extracts configuration from submitted HTML form after Component Configuration dialog validation
     * Should be overridden by each Component subclass
     * @abstract
     * @param configData
     * @param _html The submitted HTML-form
     * @throws {ComponentValidationError} If configuration contains validation errors
     * @returns The JSON version of the new Component configuration
     */
    static extractConfig(
        configData: ComponentConfigFormData,
        _html: HTMLFormElement
    ): ComponentJson & { extraConf?: unknown } {
        const componentConfigData = <
            {
                type: string;
                key?: string;
                colSpan?: number;
                rowSpan?: number;
                cssClass?: string;
                permission?: string;
                role?: string;
                editRole?: string;
                tooltip?: string;
                visibilityFormula?: string;
                editableFormula?: string;
                escapeHTML?: boolean;
                extraConf?: unknown;
            }
        >configData;

        return {
            type: componentConfigData.type,
            key: componentConfigData.key,
            colSpan: componentConfigData.colSpan,
            rowSpan: componentConfigData.rowSpan,
            cssClass: componentConfigData.cssClass,
            permission: parseInt(componentConfigData.permission ?? '0') as CONST.DOCUMENT_OWNERSHIP_LEVELS,
            role: parseInt(componentConfigData.role ?? '0') as CONST.USER_ROLES,
            editRole: parseInt(componentConfigData.editRole ?? '0') as CONST.USER_ROLES,
            tooltip: componentConfigData.tooltip,
            visibilityFormula: componentConfigData.visibilityFormula,
            editableFormula: componentConfigData.editableFormula,
            escapeHTML: componentConfigData.escapeHTML,

            extraConf: componentConfigData.extraConf
        };
    }

    /**
     * Validates if the passed JSON-Object meets all criteria for Component creation.
     * Can be overridden by each Component's subclass.
     * @param json The new Component's JSON
     * @throws {ComponentValidationError} If configuration contains validation errors
     */
    static validateConfig(json: ComponentJson): void {
        if (json.key && !json.key.match(/^[a-zA-Z0-9_]+$/)) {
            throw new AlphanumericPatternError(game.i18n.localize('CSB.ComponentProperties.ComponentKey'), json);
        }
    }
}
