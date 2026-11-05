/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * @ignore
 * @module
 */
// oxlint-disable typescript/no-deprecated

import { isBaseSheetTemplateEntity } from '../../definitions.js';
import CustomActor from '../../documents/CustomActor.js';
import CustomItem, { EquippableItemDataConstructorData } from '../../documents/CustomItem.js';
import Logger from '../../Logger.js';

import ItemSheet = foundry.appv1.sheets.ItemSheet;
import { AnyObject } from 'fvtt-types/utils';

type CustomItemSheetData = ItemSheet.Data & {
    isEmbedded: boolean;
    isEditable: boolean;
    headerPanel: JQuery<HTMLElement>;
    bodyPanel: JQuery<HTMLElement>;
};

/**
 * Extend the basic ItemSheet
 * @abstract
 * @extends {foundry.appv1.sheets.ItemSheet}
 * @ignore
 */
export class EquippableItemSheet extends ItemSheet {
    public hasBeenRenderedOnce = false;

    get item(): CustomItem {
        return super.item;
    }

    constructor(item: CustomItem, options: ItemSheet.Options) {
        options.resizable = !item.system.display?.fix_size;

        super(item, options);
    }

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['custom-system', 'sheet', 'item', 'item-v1'],
            template: 'systems/' + game.system.id + '/templates/item/item-sheet.hbs',
            width: 600,
            height: 600,
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body'
                }
            ],
            scrollY: ['.custom-system-actor-content'],
            dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }]
        });
    }

    /**
     * @override
     * @ignore
     */
    get template() {
        return `systems/${game.system.id}/templates/item/${this.item.type}-sheet.hbs`;
    }

    get title() {
        return super.title + (this.item.templateSystem.isModified ? ' *' : '');
    }

    /**
     * Define whether a user is able to begin a dragstart workflow for a given drag selector
     * @param selector       The candidate HTML selector for dragging
     * @returns              Can the current user drag this selector?
     * @protected
     * @override
     * @ignore
     */
    _canDragStart(_selector: string) {
        return this.isEditable;
    }

    /* -------------------------------------------- */

    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
     * @param selector       The candidate HTML selector for the drop target
     * @returns              Can the current user drop on this selector?
     * @protected
     * @override
     * @ignore
     */
    _canDragDrop(_selector: string) {
        return this.isEditable;
    }

    /* -------------------------------------------- */

    /** @override */
    async getData(): Promise<CustomItemSheetData> {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the items array, and the effects array.
        const baseContext = super.getData() as ItemSheet.Data;

        if (!(baseContext.item instanceof CustomItem)) {
            throw new Error('Tried to render an ActiveEffectContainerSheet without a CustomItem');
        }

        const context: CustomItemSheetData = {
            ...baseContext,
            ...(await baseContext.item.templateSystem.getSheetData()),
            isEmbedded: baseContext.item.isEmbedded,
            isEditable: this.isEditable
        } as CustomItemSheetData;

        return context;
    }

    /**
     * @override
     * @ignore
     */
    render(force: boolean, options = {}) {
        if (isBaseSheetTemplateEntity(this.item)) {
            if (!this.hasBeenRenderedOnce) {
                this.position.width = this.item.system.display.width;
                this.position.height = this.item.system.display.height;

                this.hasBeenRenderedOnce = true;
            }

            this.options.resizable = !this.item.system.display.fix_size;
        }

        if (this.item.system.container) {
            const parentCollection = this.item.getParentCollection();

            const container = parentCollection.get(this.item.system.container) as CustomItem;

            void container.prepareData();
            void container.render(false);
        }

        return super.render(force, options);
    }

    async _onSubmit(
        event: Event,
        options: foundry.appv1.api.FormApplication.OnSubmitOptions
    ): Promise<Partial<Record<string, unknown>> | false> {
        if (game.settings.get(game.system.id, 'manualEntitySaving') && event.type === 'change') {
            await this.item.templateSystem.handleSheetSubmit();
            return {};
        } else {
            this.item.templateSystem.isModified = false;
            return super._onSubmit(event, options);
        }
    }

    /**
     * Render the inner application content
     * @param data         The data used to render the inner template
     * @returns  A promise resolving to the constructed jQuery object
     * @private
     * @override
     * @ignore
     */
    async _renderInner(data: ReturnType<this['getData']>): Promise<JQuery> {
        if (this.item.templateSystem.isModified) {
            await this.submit();
        }

        const html = await super._renderInner(data);

        // Append built sheet to html
        html.find('.custom-system-customHeader').append((data as CustomItemSheetData).headerPanel);
        html.find('.custom-system-customBody').append((data as CustomItemSheetData).bodyPanel);

        return html;
    }

    /** @override */
    activateListeners(html: JQuery<HTMLElement>) {
        this.item.templateSystem.activateListeners(html);
        super.activateListeners(html);
    }

    async performDrop(event: DragEvent) {
        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event) as AnyObject;

        if (data && data.type === 'Item') {
            if (this.actor && !this.actor.isOwner) return false;

            const item = await CustomItem.fromDropData(data);

            if (CustomItem.isEquippableItem(item)) {
                Logger.debug('Got item data ' + item.name);

                // Building list of container ids of the new item position, from nearest to farthest up
                const targetContainerTree = [
                    this.item.id,
                    ...this.item.getAllContainerIds(),
                    ...(this.actor ? [this.actor.id] : [])
                ];

                // If the item is in the new container list, we cannot update it (it would contain itself)
                if (targetContainerTree.includes(item._id)) {
                    ui.notifications.error(game.i18n.localize('CSB.UserMessages.CannotMoveItemInItself'));
                    Logger.error(game.i18n.localize('CSB.UserMessages.CannotMoveItemInItself'));
                    return;
                }

                // Calculating if the item is moved in the same entity, meaning it has an item containing both the old container and the new one
                const targetParentActor: CustomActor | undefined = this.actor as CustomActor;
                const originalParentActor: CustomActor | undefined = item.parent as CustomActor;
                let originalContainerTree: Array<string> = [];
                let originalContainer: CustomItem | undefined = undefined;

                // If the item had a container, we fetch it
                if (item.system.container) {
                    if (originalParentActor) {
                        originalContainer = originalParentActor.items.get(item.system.container)!;
                    } else {
                        originalContainer = game.items.get(item.system.container)!;
                    }

                    // And we get the old container list
                    originalContainerTree = [originalContainer.id!, ...originalContainer.getAllContainerIds()];
                }

                // We add the old actor id to the list, if in an actor, to move items from the actor to an item in the actor
                if (originalParentActor) {
                    originalContainerTree.push(originalParentActor.id!);
                }

                // If an id in the original container list matches an id in the new container list, we shoudl move the item instead of copying it
                const isMove = originalContainerTree.some((id) => {
                    return targetContainerTree.includes(id);
                });

                if (isMove) {
                    const itemOrigin = originalContainer ?? originalParentActor;

                    Logger.info(
                        `Moving item ${item.name} from ${itemOrigin?.name ?? 'item sidebar'} to ${this.item.name}${
                            this.actor ? ` in ${this.actor.name}` : ''
                        }`
                    );
                    return CustomItem.updateDocuments(
                        [
                            {
                                _id: item._id,
                                system: { container: this.item.id }
                            }
                        ],
                        { parent: targetParentActor }
                    ).then(() => {
                        itemOrigin?.render(false);
                        this.render(false);
                    });
                }

                Logger.info(`Creating item ${item.name} in item ${this.item.name}`);

                return this._onDropItemCreate(item, event);
            }
        }
    }

    /** @override */
    _onDrop(event: DragEvent) {
        void this.performDrop(event);
    }

    /**
     * Handle the final creation of dropped Item data on the Actor.
     * @protected
     */
    async _onDropItemCreate(
        itemData: CustomItem | Array<CustomItem>,
        _event: DragEvent
    ): Promise<Array<CustomItem<'equippableItem'>>> {
        const items = (itemData instanceof Array ? itemData : [itemData]).filter((item) =>
            CustomItem.isEquippableItem(item)
        );
        if (!CustomItem.isEquippableItem(this.item)) {
            return [];
        }

        // Create the owned items & contents as normal
        const toCreate: Array<EquippableItemDataConstructorData> = await CustomItem.createWithContents(
            items,
            this.item
        );
        Logger.info('Created items ' + toCreate.map((item) => item._id).join(', '));
        const newItemPromise = CustomItem.createDocuments(toCreate, {
            pack: this.actor?.pack,
            parent: this.actor,
            keepId: true
        });

        void newItemPromise.then(() => {
            void this.render(false);
        });

        return newItemPromise as Promise<Array<CustomItem<'equippableItem'>>>;
    }
}

let focusedElt: string;

/* Insert tabs & header on sheet rendering */
Hooks.on('renderEquippableItemSheet', function (app: foundry.appv1.api.FormApplication, html: JQuery<HTMLElement>) {
    // Register in-sheet rich text editors
    // oxlint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Going around the protected modifier on this
    html.find('.editor-content[data-edit]').each((_i, div) => app._activateEditor(div));

    html.find('*').on('focus', (ev) => {
        focusedElt = ev.currentTarget.id;
        globalThis.focusedApp = app.id;
    });

    if (focusedElt && globalThis.focusedApp === app.id) {
        html.find('#' + focusedElt).trigger('focus');
    }
});

// oxlint-enable typescript/no-deprecated
