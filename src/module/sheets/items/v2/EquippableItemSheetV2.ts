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

import { DeepPartial } from 'fvtt-types/utils';

import { JSONObject } from '../../../definitions.js';
import CustomActor from '../../../documents/CustomActor.js';
import CustomItem, { EquippableItemDataConstructorData } from '../../../documents/CustomItem.js';
import Logger from '../../../Logger.js';
import { CustomItemSheetV2RenderContext, CustomItemSheetV2 } from './CustomItemSheetV2.js';
import DragDrop = foundry.applications.ux.DragDrop;
import DocumentSheetV2 = foundry.applications.api.DocumentSheetV2;
import ApplicationV2 = foundry.applications.api.ApplicationV2;

/**
 * Extend the basic ItemSheet
 * @abstract
 * @extends {CustomItemSheetV2}
 * @ignore
 */
export class EquippableItemSheetV2 extends CustomItemSheetV2 {
    static DEFAULT_OPTIONS: DocumentSheetV2.DefaultOptions = {
        window: {
            controls: [
                {
                    label: 'CSB.Sheets.SeeHiddenAttributes',
                    icon: 'fas fa-eye-slash',
                    action: 'openHiddenAttributes',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                }
            ]
        },
        actions: {
            openHiddenAttributes: EquippableItemSheetV2.openHiddenAttributes
        }
    };

    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/item/v2/equippableItem-sheet.hbs`;
            },
            classes: super.PARTS.form.classes
        }
    };

    static openHiddenAttributes(this: EquippableItemSheetV2, _event: MouseEvent, _target: HTMLElement) {
        void this.item.templateSystem.openAttributesVision();
    }

    /* ------------------------------------- */
    private dragDrop: Array<DragDrop>;
    private dragDropOptions: Array<Partial<DragDrop>> = [{ dragSelector: '.item-list .item', dropSelector: null }];
    constructor(options: never) {
        super(options);
        this.dragDrop = this.createDragDropHandlers();
    }

    private createDragDropHandlers(): Array<DragDrop> {
        return this.dragDropOptions.map((d) => {
            d.permissions = {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this)
            };
            d.callbacks = {
                // oxlint-disable-next-line typescript/no-misused-promises
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                // oxlint-disable-next-line typescript/no-misused-promises
                drop: this._onDrop.bind(this)
            };
            return new DragDrop.implementation(d);
        });
    }

    /**
     * Define whether a user is able to begin a dragstart workflow for a given drag selector
     * @param selector       The candidate HTML selector for dragging
     * @returns              Can the current user drag this selector?
     * @protected
     * @override
     * @ignore
     */
    _canDragStart(_selector: string | null | undefined) {
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
    _canDragDrop(_selector: string | null | undefined) {
        return this.isEditable;
    }

    /* -------------------------------------------- */

    async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions> & {
            isFirstRender: boolean;
        }
    ) {
        const context = await super._prepareContext(options);
        return {
            ...context,
            isEmbedded: this.item.isEmbedded
        };
    }

    /**
     * Render the inner application content
     * @private
     * @override
     * @ignore
     */
    async _renderHTML(
        context: CustomItemSheetV2RenderContext,
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>
    ): Promise<Record<string, HTMLElement>> {
        if ((this.item as CustomItem).templateSystem.isModified) {
            await this.submit();
        }

        const form = ((await super._renderHTML(context, options)) as { form: HTMLFormElement }).form;

        // Append built sheet to html
        if (context.headerPanel) form.querySelector('.custom-system-customHeader')!.append(context.headerPanel[0]);

        return { form };
    }

    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     */
    protected async _onRender(context: never, options: never) {
        await super._onRender(context, options);

        this.dragDrop.forEach((d) => d.bind(this.element));
    }

    async _processSubmitData(event: SubmitEvent, form: HTMLFormElement, submitData: never) {
        if (game.settings.get(game.system.id, 'manualEntitySaving') && event.type === 'change') {
            return (this.item as CustomItem).templateSystem.handleSheetSubmit();
        } else {
            (this.item as CustomItem).templateSystem.isModified = false;
            return super._processSubmitData(event, form, submitData);
        }
    }

    /**
     * Callback actions which occur at the beginning of a drag start workflow.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    async _onDragStart(event: DragEvent) {
        // Extract the data you need
        const dragData = null;

        if (!dragData) return;

        // Set data transfer
        event.dataTransfer!.setData('text/plain', JSON.stringify(dragData));
    }

    /**
     * Callback actions which occur when a dragged element is over a drop target.
     * @protected
     */
    _onDragOver(_event: DragEvent) {}

    /** @override */
    async _onDrop(event: DragEvent) {
        if (!this.item.isOwner) return;

        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);

        if (data) {
            const dragData = data as JSONObject;
            // Handle different data types
            switch (dragData.type) {
                case 'Item':
                    void this._onDropItem(event, dragData);
            }
        }
    }

    /**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @returns   The created or updated Item instances, or false if the drop was not permitted.
     * @protected
     */
    async _onDropItem(event: DragEvent, data: Item.DropData) {
        if (this.actor && !this.actor.isOwner) return false;

        const item = await CustomItem.fromDropData(data);

        if (CustomItem.isEquippableItem(item)) {
            Logger.debug('Got item data ' + item.name);

            // Building list of container ids of the new item position, from nearest to farthest up
            const targetContainerTree = [
                this.item.id,
                ...(this.item as CustomItem).getAllContainerIds(),
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

            // If an id in the original container list matches an id in the new container list, we should move the item instead of copying it
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
                    void itemOrigin?.render(false);
                    void this.render({ force: false });
                });
            }

            Logger.info(`Creating item ${item.name} in item ${this.item.name}`);

            return this._onDropItemCreate(item, event);
        }
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

    async close(options?: DeepPartial<ApplicationV2.ClosingOptions & DocumentSheetV2.RenderOptions>) {
        if (options?.renderContext !== 'deleteItem') await this.submit();
        return super.close(options);
    }
}
