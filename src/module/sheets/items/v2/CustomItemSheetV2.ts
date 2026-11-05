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

import { isBaseSheetTemplateEntity } from '../../../definitions.js';
import CustomItem from '../../../documents/CustomItem.js';
import { TemplateSystemSheetContext } from '../../../documents/TemplateSystem.js';
import { EquippableItemSheetV2 } from './EquippableItemSheetV2.js';

import DocumentSheetV2 = foundry.applications.api.DocumentSheetV2;

export type CustomItemSheetV2RenderContext = foundry.applications.sheets.ItemSheetV2.RenderContext &
    TemplateSystemSheetContext;

type CustomItemSheetV2Configuration = foundry.applications.sheets.ItemSheetV2.Configuration & {
    dragDrop: Array<foundry.applications.ux.DragDrop.Configuration>;
};

//@ts-expect-error Types too deep
export class CustomItemSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.sheets.ItemSheetV2<CustomItemSheetV2RenderContext, CustomItemSheetV2Configuration>
) {
    static DEFAULT_OPTIONS: DocumentSheetV2.DefaultOptions = {
        form: {
            submitOnChange: true
        },
        classes: ['custom-system', 'sheet', 'item', 'item-v2'],
        actions: {
            editImage: this.onEditImage
        }
    };

    static PARTS = {
        form: {
            get template(): string {
                throw new Error('Should not use this class directly');
            },
            classes: ['custom-system-item-content']
        }
    };

    private static async onEditImage(this: EquippableItemSheetV2, _event: MouseEvent, target: HTMLElement) {
        const field = target.dataset.field || 'img';
        const current = foundry.utils.getProperty(this.document, field) as string | undefined;

        const fp = new foundry.applications.apps.FilePicker.implementation({
            type: 'image',
            current: current,
            callback: (path) => {
                void this.document.update({ [field]: path });
            }
        });

        void fp.render({ force: true });
    }

    public hasBeenRenderedOnce = false;

    /** @inheritDoc */
    //@ts-expect-error Outdated types
    _initializeApplicationOptions(options: CustomItemSheetV2Configuration) {
        //@ts-expect-error Outdated types
        options = super._initializeApplicationOptions(options);

        if (options.document.system.template) {
            options.classes.push(options.document.system.template);
        }

        if (options.document.id) {
            options.classes.push(options.document.id);
        }

        if (options.document.type) {
            options.classes.push(options.document.type);
        }

        return options;
    }

    async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions> & {
            isFirstRender: boolean;
        }
    ) {
        const context = await super._prepareContext(options);

        const sheetData = await this.item.templateSystem.getSheetData();

        const isDefaultImg = context.document.img === CustomItem.DEFAULT_IMG(context.document.type);

        return {
            ...context,
            ...sheetData,
            isEditable: this.isEditable,
            isDefaultImg
        };
    }

    /**
     * @override
     * @ignore
     */
    async render(
        options?: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions> | boolean,
        trueOptions?: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>
    ) {
        if (options === undefined || typeof options === 'boolean')
            options = Object.assign(trueOptions ?? {}, { force: options });

        if (isBaseSheetTemplateEntity(this.item)) {
            options.position = {
                ...options.position,
                width: this.hasBeenRenderedOnce ? this.position.width : this.item.system.display.width,
                height: this.hasBeenRenderedOnce ? this.position.height : this.item.system.display.height
            };
            this.options.window.resizable = !this.item.system.display?.fix_size;

            this.hasBeenRenderedOnce = true;
        }

        if (CustomItem.isEquippableItem(this.item) && this.item.system.container) {
            const parentCollection = this.item.getParentCollection();
            const container = parentCollection.get(this.item.system.container) as CustomItem;

            void container.prepareData();
            void container.render(false);
        }

        return super.render(options);
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
        const form = ((await super._renderHTML(context, options)) as { form: HTMLFormElement }).form;

        if (context.bodyPanel) form.querySelector('.custom-system-customBody')!.append(context.bodyPanel[0]);

        return { form };
    }

    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     */
    protected async _onRender(context: never, options: never) {
        await super._onRender(context, options);

        (this.item as CustomItem).templateSystem.activateListeners($(this.element));
    }
}
