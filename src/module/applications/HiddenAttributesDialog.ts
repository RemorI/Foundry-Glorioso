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

import { HiddenProp } from '../definitions.js';
import CustomActor from '../documents/CustomActor.js';
import CustomItem from '../documents/CustomItem.js';
import Logger from '../Logger.js';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

type HiddenAttributesApplicationContext = {
    attributes: Array<HiddenProp>;
    buttons: Array<{ type: 'submit' | 'button'; action?: string; icon?: string; label?: string }>;
};

export default class HiddenAttributesDialog extends HandlebarsApplicationMixin(
    ApplicationV2<HiddenAttributesApplicationContext>
) {
    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            handler: HiddenAttributesDialog.saveHandler,
            submitOnChange: false,
            closeOnSubmit: false
        },
        actions: {
            cancel: HiddenAttributesDialog.cancel,
            addAttribute: HiddenAttributesDialog.addAttribute,
            removeAttribute: HiddenAttributesDialog.removeAttribute
        },
        window: {
            title: 'CSB.Attributes.EditHiddenAttributesDialog.Title',
            icon: 'fas fa-eye-slash',
            resizable: true,
            minimizable: true,
            contentClasses: ['standard-form']
        },
        position: {
            width: 500,
            height: 'auto' as const
        },
        classes: ['custom-system-editHiddenAttributes custom-system-list-dialog']
    };

    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/settings/hiddenAttributes.hbs`;
            }
        },
        footer: {
            template: 'templates/generic/form-footer.hbs'
        }
    };

    static async saveHandler(this: HiddenAttributesDialog, _event: Event, _form: HTMLFormElement, formData: FormData) {
        type formDataRawResult = {
            attributes: Record<string, HiddenProp>;
        };

        const formDataObj = foundry.utils.expandObject(Object.fromEntries(formData.entries())) as formDataRawResult;
        const attributesArray = Object.values(formDataObj.attributes ?? {});

        if (
            attributesArray.some((attribute) => {
                return !attribute.name || attribute.name === '' || !attribute.value || attribute.value === '';
            })
        ) {
            throw new Error(game.i18n.localize('CSB.Attributes.EditHiddenAttributesDialog.MissingData'));
        }

        Logger.debug(`Saving hidden attributes for ${this.entity.uuid}`, attributesArray);

        await this.entity.update({
            system: {
                hidden: attributesArray
            }
        });

        await this.close();
    }

    static async cancel(this: HiddenAttributesDialog, _event: PointerEvent, _target: HTMLElement) {
        await this.close();
    }

    static async addAttribute(this: HiddenAttributesDialog, _event: PointerEvent, target: HTMLElement) {
        const windowContent = target.closest('.window-content');
        const newAttributeRow: HTMLElement = (
            windowContent!.querySelector('.custom-system-hidden-attribute-template') as HTMLTemplateElement
        ).content.cloneNode(true) as HTMLElement;

        const currentIndex = parseInt(
            (Array.from(windowContent!.querySelectorAll('.custom-system-hidden-attribute'))?.pop() as HTMLInputElement)
                ?.dataset?.index ?? '-1'
        );

        const newIndex = currentIndex + 1;

        (newAttributeRow.querySelector('.custom-system-hidden-attribute') as HTMLLIElement).dataset.index =
            String(newIndex);
        (newAttributeRow.querySelector('.custom-system-attribute-name') as HTMLInputElement).name =
            `attributes.${newIndex}.name`;
        (newAttributeRow.querySelector('.custom-system-attribute-formula') as HTMLInputElement).name =
            `attributes.${newIndex}.value`;

        windowContent?.querySelector('.hiddenAttributesList')?.append(newAttributeRow);
    }

    static async removeAttribute(this: HiddenAttributesDialog, _event: PointerEvent, target: HTMLElement) {
        target.closest('.custom-system-hidden-attribute')?.remove();
    }

    constructor(private readonly entity: CustomActor | CustomItem) {
        super();
    }

    protected async _prepareContext(options: never) {
        const context = await super._prepareContext(options);

        context.attributes = this.entity.system.hidden ?? [];

        context.buttons = [
            { type: 'submit', icon: 'fa-solid fa-save', label: 'Save' },
            { type: 'button', action: 'cancel', icon: 'fa-solid fa-xmark', label: 'Cancel' }
        ];

        return context;
    }
}
