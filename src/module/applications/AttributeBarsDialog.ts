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

import CustomActor from '../documents/CustomActor.js';
import Logger from '../Logger.js';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

type AttributeBarsApplicationContext = {
    attributeBars: Array<RawAttributeBar>;
    buttons: Array<{ type: 'submit' | 'button'; action?: string; icon?: string; label?: string }>;
};

export type RawAttributeBar = {
    name: string;
    max: string;
    value: string;
};

export default class AttributeBarsDialog extends HandlebarsApplicationMixin(
    ApplicationV2<AttributeBarsApplicationContext>
) {
    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            handler: AttributeBarsDialog.saveHandler,
            submitOnChange: false,
            closeOnSubmit: false
        },
        actions: {
            cancel: AttributeBarsDialog.cancel,
            addAttributeBar: AttributeBarsDialog.addAttributeBar,
            removeAttributeBar: AttributeBarsDialog.removeAttributeBar
        },
        window: {
            title: 'CSB.Attributes.EditAttributeBarsDialog.Title',
            icon: 'fas fa-bars-progress',
            resizable: true,
            minimizable: true,
            contentClasses: ['standard-form']
        },
        position: {
            width: 500,
            height: 'auto' as const
        },
        classes: ['custom-system-editAttributeBars custom-system-list-dialog']
    };

    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/settings/attributeBars.hbs`;
            }
        },
        footer: {
            template: 'templates/generic/form-footer.hbs'
        }
    };

    static async saveHandler(this: AttributeBarsDialog, _event: Event, _form: HTMLFormElement, formData: FormData) {
        type formDataRawResult = {
            attributeBars: Record<string, RawAttributeBar>;
        };

        const formDataObj = foundry.utils.expandObject(Object.fromEntries(formData.entries())) as formDataRawResult;
        const attributeBarsArray = Object.values(formDataObj.attributeBars ?? {});

        if (
            attributeBarsArray.some((attribute) => {
                return (
                    !attribute.name ||
                    attribute.name === '' ||
                    !attribute.value ||
                    attribute.value === '' ||
                    !attribute.max ||
                    attribute.max === ''
                );
            })
        ) {
            throw new Error(game.i18n.localize('CSB.Attributes.EditAttributeBarsDialog.MissingData'));
        }

        const finalData: {
            [k: string]: {
                value: string;
                max: string;
                editable: boolean;
            } | null;
        } = Object.fromEntries(
            attributeBarsArray.map((attributeBar) => {
                return [attributeBar.name, { value: attributeBar.value, max: attributeBar.max, editable: false }];
            })
        );

        Logger.debug(`Saving attribute bars for ${this.entity.uuid}`, finalData);

        for (const barName in this.entity.system.attributeBar) {
            if (!finalData[barName]) {
                finalData['-=' + barName] = null;
            }
        }

        await this.entity.update({
            system: {
                attributeBar: finalData
            }
        });

        await this.close();
    }

    static async cancel(this: AttributeBarsDialog, _event: PointerEvent, _target: HTMLElement) {
        await this.close();
    }

    static async addAttributeBar(this: AttributeBarsDialog, _event: PointerEvent, target: HTMLElement) {
        const windowContent = target.closest('.window-content');
        const newAttributeBarRow: HTMLElement = (
            windowContent!.querySelector('.custom-system-attribute-bar-template') as HTMLTemplateElement
        ).content.cloneNode(true) as HTMLElement;

        const currentIndex = parseInt(
            (Array.from(windowContent!.querySelectorAll('.custom-system-attribute-bar'))?.pop() as HTMLElement)?.dataset
                ?.index ?? '-1'
        );

        const newIndex = currentIndex + 1;

        (newAttributeBarRow.querySelector('.custom-system-attribute-bar') as HTMLLIElement).dataset.index =
            String(newIndex);
        (newAttributeBarRow.querySelector('.custom-system-attribute-bar-name') as HTMLInputElement).name =
            `attributeBars.${newIndex}.name`;
        (newAttributeBarRow.querySelector('.custom-system-attribute-bar-value') as HTMLInputElement).name =
            `attributeBars.${newIndex}.value`;
        (newAttributeBarRow.querySelector('.custom-system-attribute-bar-max') as HTMLInputElement).name =
            `attributeBars.${newIndex}.max`;

        windowContent?.querySelector('.attributeBarList')?.append(newAttributeBarRow);
    }

    static async removeAttributeBar(this: AttributeBarsDialog, _event: PointerEvent, target: HTMLElement) {
        target.closest('.custom-system-attribute-bar')?.remove();
    }

    constructor(private readonly entity: CustomActor<'_template'>) {
        super();
    }

    protected async _prepareContext(options: never) {
        const context = await super._prepareContext(options);

        context.attributeBars = Object.entries(this.entity.system.attributeBar).map(([key, data]) => {
            return { name: key, value: data.value, max: data.max };
        });

        context.buttons = [
            { type: 'submit', icon: 'fa-solid fa-save', label: 'Save' },
            { type: 'button', action: 'cancel', icon: 'fa-solid fa-xmark', label: 'Cancel' }
        ];

        return context;
    }
}
