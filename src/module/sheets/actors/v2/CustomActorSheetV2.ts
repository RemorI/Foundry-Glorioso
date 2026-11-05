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

import CustomActor from '../../../documents/CustomActor.js';
import { TemplateSystemSheetContext } from '../../../documents/TemplateSystem.js';
import ActorSheetV2 = foundry.applications.sheets.ActorSheetV2;
import DocumentSheetV2 = foundry.applications.api.DocumentSheetV2;

type CustomActorSheetV2RenderContext = ActorSheetV2.RenderContext & TemplateSystemSheetContext;

type CustomActorSheetV2Configuration = ActorSheetV2.Configuration & {
    dragDrop: Array<foundry.applications.ux.DragDrop.Configuration>;
};

/**
 * Extend the basic ActorSheet
 * @abstract
 */
//@ts-expect-error Types too deep
export class CustomActorSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.sheets.ActorSheetV2<CustomActorSheetV2RenderContext, CustomActorSheetV2Configuration>
) {
    static DEFAULT_OPTIONS: DocumentSheetV2.DefaultOptions<CustomActorSheetV2> = {
        form: {
            submitOnChange: true
        },
        classes: ['custom-system', 'sheet', 'actor', 'actor-v2'],
        actions: {
            editImage: this.onEditImage
        }
    };

    static PARTS = {
        form: {
            get template() {
                return '';
            },
            classes: ['custom-system-actor-content']
        }
    };

    private static async onEditImage(this: CustomActorSheetV2, _event: MouseEvent, target: HTMLElement) {
        const field = target.dataset.field || 'img';
        const current = <string | undefined>foundry.utils.getProperty(this.document, field);

        const fp = new foundry.applications.apps.FilePicker.implementation({
            type: 'image',
            current: current,
            callback: (path) => {
                void this.document.update({ [field]: path });
            }
        });

        await fp.render({ force: true });
    }

    /* -------------------------------------------- */

    public hasBeenRenderedOnce = false;

    constructor(options: never) {
        super(options);
        this.options.window.resizable = !(this.document as CustomActor<'character'>).system.display?.fix_size;
    }

    /** @inheritDoc */
    //@ts-expect-error Outdated types
    _initializeApplicationOptions(options: CustomActorSheetV2Configuration) {
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
        const sheetData = await this.actor.templateSystem.getSheetData();

        const isDefaultImg = context.document.img === CustomActor.DEFAULT_IMG(context.document.type);

        return { ...context, ...sheetData, isDefaultImg };
    }

    async render(
        options?: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions> | boolean,
        trueOptions?: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>
    ): Promise<this> {
        if (options === undefined || typeof options === 'boolean')
            options = Object.assign(trueOptions ?? {}, { force: options });

        if (CustomActor.isCharacterActor(this.actor) || CustomActor.isTemplateActor(this.actor)) {
            options.position = {
                ...options.position,
                width: this.hasBeenRenderedOnce ? this.position.width : this.actor.system.display.width,
                height: this.hasBeenRenderedOnce ? this.position.height : this.actor.system.display.height
            };
            this.options.window.resizable = !this.actor.system.display?.fix_size;

            this.hasBeenRenderedOnce = true;
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
        context: CustomActorSheetV2RenderContext,
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>
    ): Promise<Record<string, HTMLElement>> {
        const form = ((await super._renderHTML(context, options)) as { form: HTMLFormElement }).form;

        // Append built sheet to html
        if (context.headerPanel) form.querySelector('.custom-system-customHeader')!.append(context.headerPanel[0]);

        if (context.bodyPanel) form.querySelector('.custom-system-customBody')!.append(context.bodyPanel[0]);

        return { form };
    }

    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     */
    protected async _onRender(context: never, options: never) {
        await super._onRender(context, options);

        (this.actor as CustomActor).templateSystem.activateListeners($(this.element));
    }
}
