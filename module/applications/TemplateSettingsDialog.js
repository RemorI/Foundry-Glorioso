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
/**
 * @ignore
 * @module
 */
export default class TemplateSettingsDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    entity;
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
            width: 'auto',
            height: 'auto'
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
    static FIELD_RULES = {
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
        },
        'display.height': {
            required: true,
            type: 'number',
            integer: true,
            min: 100,
            max: Number.MAX_VALUE,
            default: 600
        },
        'display.pp_width': {
            required: false,
            type: 'number',
            integer: true,
            min: 0,
            max: Number.MAX_VALUE,
            default: 64
        },
        'display.pp_height': {
            required: false,
            type: 'number',
            integer: true,
            min: 0,
            max: Number.MAX_VALUE,
            default: 64
        },
        'display.fix_size': {
            required: false,
            type: 'boolean',
            default: false
        }
    };
    static async saveHandler(_event, _form, formData) {
        const finalValuesFlat = {};
        for (const field of Object.keys(TemplateSettingsDialog.FIELD_RULES)) {
            const value = TemplateSettingsDialog.validateField(field, formData.get(field));
            finalValuesFlat[field] = value;
        }
        const finalValues = foundry.utils.expandObject(finalValuesFlat);
        Logger.debug(`Saving template settings for ${this.entity.uuid}`, finalValues);
        await this.entity
            .update({
                system: {
                    initiativeFormula: finalValues.combat.initiativeFormula,
                    display: finalValues.display
                }
            })
            .then(() => {
                this.entity.sheet.hasBeenRenderedOnce = false;
                this.entity.render();
            });
        await this.close();
    }
    static validateField(name, value) {
        if (Object.keys(TemplateSettingsDialog.FIELD_RULES).includes(name)) {
            const rules = TemplateSettingsDialog.FIELD_RULES[name];
            switch (rules.type) {
                case 'string':
                    return this.validateString(name, value, rules);
                case 'number':
                    return this.validateNumber(name, value, rules);
                case 'boolean':
                    return this.validateBoolean(name, value, rules);
                default:
                    return value;
            }
        }
    }
    static validateString(name, value, rules) {
        if (value === undefined) {
            if (rules.required) {
                throw new Error(`${name} is mandatory`);
            }
            return rules.default;
        } else {
            return String(value);
        }
    }
    static validateNumber(name, value, rules) {
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
    static validateBoolean(name, value, rules) {
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
    static async cancel(_event, _target) {
        await this.close();
    }
    static async defaultValues(_event, target) {
        const appRoot = target.closest('.custom-system-editDisplaySettings');
        for (const field of Object.keys(TemplateSettingsDialog.FIELD_RULES)) {
            const htmlElement = appRoot.querySelector(`[name=${field}]`);
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
    constructor(entity) {
        super();
        this.entity = entity;
    }
    async _prepareContext(options) {
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
//# sourceMappingURL=TemplateSettingsDialog.js.map
