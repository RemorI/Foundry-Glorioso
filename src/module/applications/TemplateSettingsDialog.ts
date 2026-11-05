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
import CustomItem from '../documents/CustomItem.js';
import Logger from '../Logger.js';
import { TemplateSheetV2 } from '../sheets/actors/v2/TemplateSheetV2.js';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

type FormResult = {
    combat: {
        initiativeFormula?: string;
    };
    display: {
        width: number;
        height: number;
        pp_width: number;
        pp_height: number;
        fix_size: boolean;
    };
};

type TemplateSettingsApplicationContext = FormResult & {
    appId: string;
    isActor: boolean;
    buttons: Array<{ type: 'submit' | 'button'; action?: string; icon?: string; label?: string }>;
};

interface ValidationRule {
    type: 'number' | 'boolean' | 'string';
    required: boolean;
    default?: string | number | boolean;
}

interface StringValidationRule extends ValidationRule {
    type: 'string';
    default?: string;
}

interface NumberValidationRule extends ValidationRule {
    type: 'number';
    integer: boolean;
    min: number;
    max: number;
    default?: number;
}

interface BooleanValidationRule extends ValidationRule {
    type: 'boolean';
    default?: boolean;
}

/**
 * @ignore
 * @module
 */
export default class TemplateSettingsDialog extends HandlebarsApplicationMixin(
    ApplicationV2<TemplateSettingsApplicationContext>
) {
    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            handler: TemplateSettingsDialog.saveHandler,
            submitOnChange: false,
            closeOnSubmit: false
        },
        actions: {
            cancel: TemplateSettingsDialog.cancel,
            defaultValues: TemplateSettingsDialog.defaultValues
        },
        window: {
            title: 'CSB.TemplateSettings.SettingsDialog.Title',
            icon: 'fas fa-window',
            resizable: false,
            minimizable: true,
            contentClasses: ['standard-form']
        },
        position: {
            width: 'auto' as const,
            height: 'auto' as const
        },
        classes: ['custom-system-editTemplateSettings']
    };

    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/settings/templateSettings.hbs`;
            }
        },
        footer: {
            template: 'templates/generic/form-footer.hbs'
        }
    };

    private static FIELD_RULES: Record<string, ValidationRule> = {
        'combat.initiativeFormula': {
            required: true,
            type: 'string'
        },
        'display.width': {
            required: true,
            type: 'number',
            integer: true,
            min: 100,
            max: Number.MAX_VALUE,
            default: 600
        } as NumberValidationRule,
        'display.height': {
            required: true,
            type: 'number',
            integer: true,
            min: 100,
            max: Number.MAX_VALUE,
            default: 600
        } as NumberValidationRule,
        'display.pp_width': {
            required: false,
            type: 'number',
            integer: true,
            min: 0,
            max: Number.MAX_VALUE,
            default: 64
        } as NumberValidationRule,
        'display.pp_height': {
            required: false,
            type: 'number',
            integer: true,
            min: 0,
            max: Number.MAX_VALUE,
            default: 64
        } as NumberValidationRule,
        'display.fix_size': {
            required: false,
            type: 'boolean',
            default: false
        }
    };

    static async saveHandler(this: TemplateSettingsDialog, _event: Event, _form: HTMLFormElement, formData: FormData) {
        const finalValuesFlat: Record<string, unknown> = {};

        for (const field of Object.keys(TemplateSettingsDialog.FIELD_RULES)) {
            const value = TemplateSettingsDialog.validateField(field, formData.get(field));

            finalValuesFlat[field] = value;
        }

        const finalValues = foundry.utils.expandObject(finalValuesFlat) as FormResult;

        Logger.debug(`Saving template settings for ${this.entity.uuid}`, finalValues);

        await this.entity
            .update({
                system: {
                    initiativeFormula: finalValues.combat.initiativeFormula,
                    display: finalValues.display
                }
            })
            .then(() => {
                (this.entity.sheet as TemplateSheetV2).hasBeenRenderedOnce = false;
                this.entity.render();
            });

        await this.close();
    }

    private static validateField(name: keyof typeof TemplateSettingsDialog.FIELD_RULES, value: unknown): unknown {
        if (Object.keys(TemplateSettingsDialog.FIELD_RULES).includes(name)) {
            const rules = TemplateSettingsDialog.FIELD_RULES[name];

            switch (rules.type) {
                case 'string':
                    return this.validateString(name, value, rules as StringValidationRule);
                case 'number':
                    return this.validateNumber(name, value, rules as NumberValidationRule);
                case 'boolean':
                    return this.validateBoolean(name, value, rules as BooleanValidationRule);
                default:
                    return value;
            }
        }
    }

    private static validateString(
        name: keyof typeof TemplateSettingsDialog.FIELD_RULES,
        value: unknown,
        rules: StringValidationRule
    ): string | undefined {
        if (value === undefined) {
            if (rules.required) {
                throw new Error(`${name} is mandatory`);
            }

            return rules.default;
        } else {
            return String(value);
        }
    }

    private static validateNumber(
        name: keyof typeof TemplateSettingsDialog.FIELD_RULES,
        value: unknown,
        rules: NumberValidationRule
    ): number | undefined {
        if (value === undefined) {
            if (rules.required) {
                throw new Error(`${name} is mandatory`);
            }

            return rules.default;
        } else {
            if (!Number.isNumeric(value)) {
                throw new Error(`${name} must be a Number`);
            }

            const numberValue = Number(value);

            if (rules.integer && !Number.isInteger(numberValue)) {
                throw new Error(`${name} must be an Integer`);
            }

            if (numberValue < rules.min) {
                throw new Error(`${name} must be greater than ${rules.min}`);
            }

            if (numberValue > rules.max) {
                throw new Error(`${name} must be lesser than ${rules.max}`);
            }

            return numberValue;
        }
    }

    private static validateBoolean(
        name: keyof typeof TemplateSettingsDialog.FIELD_RULES,
        value: unknown,
        rules: BooleanValidationRule
    ): boolean | undefined {
        if (value === undefined) {
            if (rules.required) {
                throw new Error(`${name} is mandatory`);
            }

            return rules.default;
        } else {
            if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
                throw new Error(`${name} must be a Boolean`);
            }

            return !!value && value !== 'false';
        }
    }

    static async cancel(this: TemplateSettingsDialog, _event: PointerEvent, _target: HTMLElement) {
        await this.close();
    }

    static async defaultValues(this: TemplateSettingsDialog, _event: PointerEvent, target: HTMLElement) {
        const appRoot = target.closest('.custom-system-editDisplaySettings');

        for (const field of Object.keys(TemplateSettingsDialog.FIELD_RULES)) {
            const htmlElement = appRoot!.querySelector(`[name=${field}]`) as HTMLInputElement;

            switch (htmlElement.type) {
                case 'checkbox':
                    htmlElement.checked = !!TemplateSettingsDialog.FIELD_RULES[field].default;
                    break;
                default:
                    htmlElement.value = TemplateSettingsDialog.FIELD_RULES[field].default?.toString() ?? '';
                    break;
            }
        }
    }

    constructor(private readonly entity: CustomActor<'_template'> | CustomItem<'_equippableItemTemplate'>) {
        super();
    }

    protected async _prepareContext(options: never) {
        const context = await super._prepareContext(options);

        context.appId = this.id;
        context.isActor = CustomActor.isTemplateActor(this.entity);
        context.combat = {
            initiativeFormula: CustomActor.isTemplateActor(this.entity)
                ? this.entity.system.initiativeFormula
                : undefined
        };

        context.display = this.entity.system.display;

        context.buttons = [
            { type: 'submit', icon: 'fa-solid fa-save', label: 'Save' },
            { type: 'button', action: 'defaultValues', icon: 'fa-solid fa-undo', label: 'Reset' },
            { type: 'button', action: 'cancel', icon: 'fa-solid fa-xmark', label: 'Cancel' }
        ];

        return context;
    }
}
