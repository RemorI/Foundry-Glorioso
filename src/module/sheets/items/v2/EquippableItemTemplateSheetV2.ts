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

import CustomItem from '../../../documents/CustomItem.js';
import { CustomItemSheetV2RenderContext, CustomItemSheetV2 } from './CustomItemSheetV2.js';

import DocumentSheetV2 = foundry.applications.api.DocumentSheetV2;

/**
 * Extend the basic EquippableItemSheetV2 with some very simple modifications
 * @ignore
 */
export class EquippableItemTemplateSheetV2 extends CustomItemSheetV2 {
    static DEFAULT_OPTIONS: DocumentSheetV2.DefaultOptions = {
        window: {
            controls: [
                {
                    label: 'CSB.TemplateActions.ConfigureTemplateSettings',
                    icon: 'fas fa-window',
                    action: 'configureTemplateSettings',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                },
                {
                    label: 'CSB.TemplateActions.ConfigureHiddenAttributes',
                    icon: 'fas fa-eye-slash',
                    action: 'configureHiddenAttributes',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                },
                {
                    label: 'CSB.TemplateActions.ReloadItemSheet',
                    icon: 'fas fa-arrows-rotate',
                    action: 'reloadItemSheet',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                }
            ]
        },
        actions: {
            configureTemplateSettings: EquippableItemTemplateSheetV2.configureTemplateSettings,
            configureHiddenAttributes: EquippableItemTemplateSheetV2.configureHiddenAttributes,
            reloadItemSheet: EquippableItemTemplateSheetV2.reloadItemSheet
        }
    };

    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/item/v2/_equippableItemTemplate-sheet.hbs`;
            },
            classes: super.PARTS.form.classes
        }
    };

    static configureTemplateSettings(this: EquippableItemTemplateSheetV2, _event: MouseEvent, _target: HTMLElement) {
        void this.item.templateSystem.editTemplateSettings();
    }

    static configureHiddenAttributes(this: EquippableItemTemplateSheetV2, _event: MouseEvent, _target: HTMLElement) {
        void this.item.templateSystem.configureAttributes();
    }

    static reloadItemSheet(this: EquippableItemTemplateSheetV2, _event: MouseEvent, _target: HTMLElement) {
        void this.item.templateSystem.reloadAllSheets();
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
}
