/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { JSONObject } from '../definitions.js';
import Logger from '../Logger.js';
import { DESCRIPTION_FORMAT } from '../sheets/components/ActiveEffectContainer.js';
import { getGameCollection } from '../utils.js';
import CustomActiveEffect from './CustomActiveEffect.js';
import CustomActor from './CustomActor.js';
import { BaseItemDataModel, EquippableItemDataModel } from './model/itemModel.js';
import TemplateSystem from './TemplateSystem.js';

export const CustomItemTypes = [
    'equippableItem',
    '_equippableItemTemplate',
    'subTemplate',
    'userInputTemplate',
    'activeEffectContainer'
] as const;

/**
 * @ignore
 */
export type CustomItemDataConstructorData<SubType extends Item.SubType = Item.SubType> = Item.CreateData<SubType> & {
    _id?: string;
    system?: BaseItemDataModel;
};

/**
 * @ignore
 */
export type EquippableItemDataConstructorData<SubType extends Item.SubType = Item.SubType> =
    CustomItemDataConstructorData<SubType> & {
        _id?: string;
        system?: EquippableItemDataModel;
        items?: Array<EquippableItemDataConstructorData>;
    };

export default class CustomItem<SubType extends Item.SubType = Item.SubType> extends Item<SubType> {
    static isEquippableItem(item: unknown): item is CustomItem<'equippableItem'> {
        return !!item && item instanceof CustomItem && item.type === 'equippableItem';
    }
    static isEquippableItemTemplate(item: unknown): item is CustomItem<'_equippableItemTemplate'> {
        return !!item && item instanceof CustomItem && item.type === '_equippableItemTemplate';
    }
    static isSubTemplate(item: unknown): item is CustomItem<'subTemplate'> {
        return !!item && item instanceof CustomItem && item.type === 'subTemplate';
    }
    static isUserInputTemplate(item: unknown): item is CustomItem<'userInputTemplate'> {
        return !!item && item instanceof CustomItem && item.type === 'userInputTemplate';
    }
    static isActiveEffectContainer(item: unknown): item is CustomItem<'activeEffectContainer'> {
        return !!item && item instanceof CustomItem && item.type === 'activeEffectContainer';
    }
    static isTemplateItem(
        item: unknown
    ): item is CustomItem<'_equippableItemTemplate'> | CustomItem<'subTemplate'> | CustomItem<'userInputTemplate'> {
        return this.isEquippableItemTemplate(item) || this.isSubTemplate(item) || this.isUserInputTemplate(item);
    }

    static DEFAULT_IMG(itemType: Item.SubType = 'base') {
        switch (itemType) {
            case 'equippableItem':
                return `icons/svg/item-bag.svg`;
            case 'activeEffectContainer':
                return `icons/svg/aura.svg`;
            case '_equippableItemTemplate':
                return `systems/${game.system.id}/img/template-logo.svg`;
            case 'subTemplate':
                return `systems/${game.system.id}/img/subtemplate-logo.svg`;
            case 'userInputTemplate':
                return `systems/${game.system.id}/img/user-input-logo.svg`;
            default:
                return `icons/svg/item-bag.svg`;
        }
    }

    static async createDialog(
        data?: Item.CreateDialogData,
        createOptions?: Item.Database.CreateDocumentsOperation,
        options: JSONObject = {}
    ) {
        options.types = this.TYPES.filter(
            (type: string) => type !== CONST.BASE_DOCUMENT_TYPE && type !== 'activeEffectContainer'
        );

        return super.createDialog(data, createOptions, options);
    }

    /**
     * Maximum depth items can be nested in containers.
     * @type {number}
     */
    static MAX_DEPTH: number = 5;

    static EMBEDDED_ITEMS_FOLDER_NAME = 'CSB - Embedded Items Folder - DO NOT RENAME OR REMOVE';

    static getEmbeddedItemsFolder(warnIfNotFound = true) {
        const folder = game.items.folders.getName(this.EMBEDDED_ITEMS_FOLDER_NAME);

        if (!folder && warnIfNotFound) {
            ui.notifications.warn(
                game.i18n.format('CSB.UserMessages.EmbeddedItemsFolderNotFound', {
                    EMBEDDED_ITEMS_FOLDER_NAME: this.EMBEDDED_ITEMS_FOLDER_NAME
                })
            );
        }

        return folder;
    }

    isEquippableItem(): this is CustomItem<'equippableItem'> {
        return CustomItem.isEquippableItem(this);
    }
    isEquippableItemTemplate(): this is CustomItem<'_equippableItemTemplate'> {
        return CustomItem.isEquippableItemTemplate(this);
    }
    isSubTemplate(): this is CustomItem<'subTemplate'> {
        return CustomItem.isSubTemplate(this);
    }
    isUserInputTemplate(): this is CustomItem<'userInputTemplate'> {
        return CustomItem.isUserInputTemplate(this);
    }
    isActiveEffectContainer(): this is CustomItem<'activeEffectContainer'> {
        return CustomItem.isActiveEffectContainer(this);
    }
    isTemplateItem(): this is
        | CustomItem<'_equippableItemTemplate'>
        | CustomItem<'subTemplate'>
        | CustomItem<'userInputTemplate'> {
        return CustomItem.isTemplateItem(this);
    }

    declare parent: CustomActor<'character'> | null;

    private _templateSystem?: TemplateSystem<CustomItem>;

    constructor(data: CustomItemDataConstructorData, context?: never) {
        if (data?.flags?.['dfreds-convenient-effects'] && data.type !== 'activeEffectContainer') {
            data.type = 'activeEffectContainer';
        }

        if (data.type === 'activeEffectContainer') {
            if (!data.flags?.['dfreds-convenient-effects']) {
                if (!data.flags) {
                    data.flags = {};
                }

                data.flags['dfreds-convenient-effects'] = {
                    folderColor: '',
                    isBackup: false,
                    isConvenient: true,
                    isViewable: true
                };
            }

            if (!data.system) {
                data.system = new BaseItemDataModel();
            }

            data.system.body.contents = [
                {
                    type: 'activeEffectContainer',
                    key: 'activeEffects',
                    staticRowLayout: {
                        active: {
                            enabled: false,
                            colName: 'Active',
                            align: 'left',
                            sort: 1
                        },
                        name: {
                            enabled: true,
                            colName: 'Name',
                            align: 'center',
                            sort: 2
                        },
                        origin: {
                            enabled: false,
                            colName: 'Origin',
                            align: 'center',
                            sort: 3
                        },
                        description: {
                            enabled: true,
                            colName: 'Description',
                            align: 'left',
                            sort: 4,
                            format: 'full' as DESCRIPTION_FORMAT.FULL
                        },
                        count: {
                            enabled: false,
                            colName: 'Count',
                            align: 'center',
                            sort: 5
                        }
                    },
                    templateAddress: 'body.contents.0'
                }
            ];
        }

        super(data as never, context);
    }

    /**
     * Is this item an assignable Template ?
     */
    get isAssignableTemplate(): boolean {
        return CustomItem.isEquippableItemTemplate(this);
    }

    /**
     * Fetch this entity
     * @deprecated
     */
    get entity(): this {
        Logger.warn(
            `${this.uuid}: entity.entity is now deprecated, since entity already is the Item. please change all the "entity.entity" in your script for just "entity". This will be removed in CSB 7.0.0 - FoundryVTT 15`
        );
        return this;
    }

    /**
     * Template system in charge of generic templating handling
     */
    get templateSystem(): TemplateSystem {
        if (!this._templateSystem) {
            this._templateSystem = new TemplateSystem(this);
        }

        return this._templateSystem;
    }

    /**
     * @ignore
     */
    get items() {
        let baseCollection: Collection<CustomItem> = getGameCollection('item');
        if (this.isEmbedded) {
            baseCollection = this.parent!.items as Collection<CustomItem>;
        }

        return new Collection<CustomItem<'equippableItem'>>(
            (baseCollection.filter((item) => CustomItem.isEquippableItem(item)) as Array<CustomItem<'equippableItem'>>)
                .filter((item) => item.system.container && this.id && item.system.container === this.id)
                .map((item) => [item.id!, item])
        );
    }

    getItems() {
        return this.items;
    }

    getParent(): CustomActor<'character'> | CustomItem<'equippableItem'> | undefined {
        if (!CustomItem.isEquippableItem(this)) {
            return;
        }

        if (!this.system.container) {
            return this.parent ?? undefined;
        }

        let parentItem;
        if (this.isEmbedded) {
            parentItem = this.parent!.items.get(this.system.container);
        } else {
            parentItem = game.items.find((item) => item.id === this.system.container);
        }

        return CustomItem.isEquippableItem(parentItem) ? parentItem : undefined;
    }

    getParentCollection(): Collection<CustomItem> {
        if (this.isEmbedded) {
            return this.parent!.items as Collection<CustomItem>;
        } else {
            if (this.pack) {
                return game.packs.get(this.pack)!.index as Collection<CustomItem>;
            } else {
                return getGameCollection('item');
            }
        }
    }

    /**
     * Returns the list of the ids of items containing this item
     * @returns {Array<string>}
     */
    getAllContainerIds(): Array<string> {
        const parent = this.getParent();

        if (!(parent instanceof CustomItem)) {
            return [];
        }

        return [parent.id!, ...parent.getAllContainerIds()];
    }

    /**
     * Get all ActiveEffects that are created on this Item.
     * @yields {CustomActiveEffect}
     * @returns {Generator<CustomActiveEffect, void, void>}
     */
    *allApplicableEffects({ excludeExternal = false, excludeTransfer = true } = {}): Generator<
        CustomActiveEffect,
        void,
        void
    > {
        for (const effect of this.effects) {
            if (!(excludeTransfer && effect.transfer)) {
                if (this.isEquippableItem()) {
                    yield effect.computeEffectKeys(this, false);
                } else {
                    yield effect as CustomActiveEffect;
                }
            }
        }

        if (!excludeExternal) {
            for (const item of this.getItems()) {
                for (const effect of item.effects) {
                    if (effect.transfer) {
                        if (this.isEquippableItem()) {
                            yield effect.computeEffectKeys(this, false);
                        } else {
                            yield effect as CustomActiveEffect;
                        }
                    }
                }
            }
        }
    }

    /**
     * Prepare creation data for the provided items and any items contained within them. The data created by this method
     * can be passed to `createDocuments` with `keepId` always set to true to maintain links to container contents.
     * @param  items                     Items to create.
     * @param Container                     Container for the items.
     * @returns                Data for items to be created.
     */
    static async createWithContents(
        items: CustomItem<'equippableItem'>[],
        container?: CustomItem<'equippableItem'>
    ): Promise<EquippableItemDataConstructorData[]> {
        const depth = 0;
        const created: Array<EquippableItemDataConstructorData> = [];

        const createItemData = async (
            item: CustomItem | EquippableItemDataConstructorData,
            containerId: string | null | undefined,
            depth: number
        ) => {
            let newItemData: EquippableItemDataConstructorData;
            if (!item) {
                return;
            }

            if (item instanceof CustomItem) {
                newItemData = item.toObject();
            } else {
                newItemData = item;
            }

            newItemData.system!.container = containerId ?? undefined;
            newItemData.folder = this.getEmbeddedItemsFolder() ?? null;

            newItemData._id = foundry.utils.randomID();

            created.push(newItemData);

            if (item.items) {
                if (depth > CustomItem.MAX_DEPTH) {
                    ui.notifications.warn(
                        game.i18n.format('CSB.UserMessages.ItemMaxDepth', {
                            depth: String(CustomItem.MAX_DEPTH)
                        })
                    );
                }

                for (const doc of item.items) await createItemData(doc, newItemData._id, depth + 1);
            }
        };

        for (const item of items) await createItemData(item, container?.id, depth);
        return created;
    }
    prepareData() {
        this.templateSystem.prepareData();
    }

    /**
     * @override
     * @inheritDoc
     * @ignore
     */
    getRollData() {
        return this.templateSystem.getRollData();
    }

    static async create(
        data: CustomItemDataConstructorData,
        options?: { keepId: boolean }
    ): Promise<Item.Stored | undefined> {
        const newItem = await super.create<CustomItemDataConstructorData>(data, options);

        if (newItem) {
            for (const subItem of (data as EquippableItemDataConstructorData).items ?? []) {
                subItem.system!.container = newItem.id!;
                subItem.folder = this.getEmbeddedItemsFolder();
                await CustomItem.create(subItem, options);
            }
        }

        return newItem;
    }

    protected async _preCreate(
        data: Item.CreateData,
        _options: Item.Database.PreCreateOptions,
        _user: User.Implementation
    ): Promise<boolean | void> {
        const baseDefaultImg = CustomItem.DEFAULT_IMG();
        const typeDefaultImg = CustomItem.DEFAULT_IMG(this.type);

        if (this.img === baseDefaultImg && typeDefaultImg !== baseDefaultImg) {
            this.updateSource({ img: typeDefaultImg });
            data.img = typeDefaultImg;
        }

        return true;
    }

    /**
     * @override
     * @ignore
     */
    _onCreate(data: Item.CreateData, options: Item.Database.OnCreateOperation, userId: string) {
        super._onCreate(data, options, userId);

        if (this.permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            if (!(data.flags?.[game.system.id] as Record<string, string> | undefined)?.version) {
                void this.setFlag(game.system.id, 'version', game.system.version);
            }

            if (!this.parent) {
                void this.update({
                    system: {
                        uniqueId: data._id as string
                    }
                });
            }
        }
    }

    async _preDelete(options: Item.Database.PreDeleteOptions, user: User.Stored) {
        // Handling of nested items
        let parentCollection = getGameCollection('item');
        if (this.isEmbedded) {
            parentCollection = this.parent!.items as Collection<CustomItem>;
        }

        const deletionPromises: Array<Promise<unknown>> = [];

        parentCollection
            .filter((item) => CustomItem.isEquippableItem(item) && item.system.container === this.id)
            .forEach((item) => {
                deletionPromises.push(item.delete());
            });

        await Promise.allSettled(deletionPromises);

        return super._preDelete(options, user);
    }

    /**
     * @override
     * @ignore
     */
    _preCreateDescendantDocuments(
        parent: Item.Stored,
        collection: string,
        data: unknown[],
        options: object,
        userId: string
    ) {
        if (collection === 'Item') {
            if (this.isTemplateItem()) {
                data.splice(0, data.length);
            } else {
                const idxToRemove = [];
                for (const document of data as Record<string, unknown>[]) {
                    if (document.type !== 'equippableItem') {
                        idxToRemove.push(data.indexOf(document));
                    }
                }

                for (let i = idxToRemove.length - 1; i >= 0; i--) {
                    data.splice(idxToRemove[i], 1);
                }
            }
        } else {
            super._preCreateDescendantDocuments(
                parent,
                collection as 'effects',
                data as never[],
                options as never,
                userId
            );
        }
    }

    /**
     * @ignore
     */
    exportToJSON(options = {}) {
        super.exportToJSON({
            ...options,
            keepId: true
        });
    }

    //@ts-expect-error Types too complicated
    toObject() {
        const result = { ...super.toObject() } as EquippableItemDataConstructorData;

        result.items = [];

        for (const subItem of this.items) {
            result.items.push(subItem.toObject());
        }

        return result;
    }

    /**
     * @ignore
     */
    //@ts-expect-error Type too complicated
    toCompendium(pack: never, options: never) {
        const data = super.toCompendium(pack, options);

        for (const item of this.items) {
            item.toCompendium(pack, options);
        }

        return data;
    }

    /**
     * @override
     * @ignore
     */
    //@ts-expect-error Lib expects return this, but the keepId system won't allow it
    async importFromJSON(json: string, subFolder = false) {
        const updated = await super.importFromJSON(json);

        const imported = JSON.parse(json) as EquippableItemDataConstructorData;

        const res = await CustomItem.create(
            {
                ...updated.toObject(),
                _id: imported._id,
                folder: subFolder ? CustomItem.getEmbeddedItemsFolder() : updated.folder
            },
            {
                keepId: true
            }
        );

        if (res) {
            for (const subItemJSON of imported.items ?? []) {
                subItemJSON.system!.container = res.id;

                await CustomItem.create({
                    ...subItemJSON,
                    folder: CustomItem.getEmbeddedItemsFolder()
                });
            }
        }

        await updated.delete();

        return res;
    }

    clone<Save extends boolean | undefined = false>(
        data: Item.UpdateData | undefined = {},
        options: object = { save: false }
    ) {
        const newItem = super.clone<Save>(data, options);

        for (const subItem of this.items ?? []) {
            (subItem as CustomItem).clone(
                { system: { container: (newItem as { id: string }).id } },
                { ...options, folder: CustomItem.getEmbeddedItemsFolder() }
            );
        }

        return newItem;
    }
}

Hooks.on('renderItemDirectory', (directory: foundry.applications.sidebar.tabs.ItemDirectory) => {
    const activeEffectContainersIds = game.items
        .filter((item) => {
            return CustomItem.isActiveEffectContainer(item);
        })
        .map((item) => item.id);

    if (!activeEffectContainersIds) return;

    const $html = $(directory.element);
    activeEffectContainersIds.forEach((activeEffectContainersId) => {
        const $li = $html.find(`li[data-entry-id="${activeEffectContainersId}"]`);
        $li.remove();
    });

    const entries = $html.find('li[data-entry-id]');
    entries.each((_idx, elt) => {
        if (elt.dataset.entryId) {
            const item = game.items.get(elt.dataset.entryId);

            if (item && item.img === CustomItem.DEFAULT_IMG(item.type)) {
                $(elt).find('img').addClass('csb-filter-default-svg');
            }
        }
    });
});
