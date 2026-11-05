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

import { JSONObject } from '../../definitions.js';
import TemplateSystem, { AppliedTemplateSystem } from '../../documents/TemplateSystem.js';
import { ComponentConfigFormData, ComponentRenderOptions, ComponentValueType } from './Component.js';
import Container from './Container.js';
import InputComponent, {
    InputComponentJson,
    InputComponentProps,
    InputComponentRenderOptions
} from './InputComponent.js';
import { COMPONENT_SIZES } from './SizedComponent.js';

export type CheckboxProps = InputComponentProps & {
    defaultChecked?: boolean;
};

export type CheckboxJson = InputComponentJson & {
    defaultChecked?: boolean;
};

/**
 * Checkbox component
 * @ignore
 */
class Checkbox extends InputComponent {
    static valueType: ComponentValueType = 'boolean';

    /**
     * Checkbox default state
     */
    protected _defaultChecked: boolean;

    /**
     * Checkbox constructor
     */
    constructor(props: CheckboxProps) {
        super(props);

        this._defaultChecked = props.defaultChecked ?? false;
    }

    /**
     * Renders component
     * @override
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user?
     * @param options Additional options usable by the final Component
     * @returns The jQuery element holding the component
     */
    async _getElement(
        entity: TemplateSystem,
        isEditable: boolean = true,
        options: InputComponentRenderOptions = {}
    ): Promise<JQuery> {
        const props = { ...entity.getRollData(), ...options.customProps };

        const jQElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-checkbox');

        const inputElement = $<HTMLInputElement>('<input />');
        inputElement.attr('type', 'checkbox');
        inputElement.attr('id', this.getSluggedId(entity));

        const checkedStatus = foundry.utils.getProperty(props, this.key);
        const checked = checkedStatus || (checkedStatus === undefined && this._defaultChecked);

        if (checked) {
            inputElement.attr('checked', 'checked');
        }

        jQElement.append(inputElement);

        if (TemplateSystem.isAppliedTemplateSystem(entity)) {
            if (!options.noName) {
                inputElement.attr('name', 'system.props.' + this.key);
                foundry.utils.setProperty(entity.system.props, this.key, checked);
            }

            if (!isEditable) {
                inputElement.attr('disabled', 'disabled');
            }
        }

        if (TemplateSystem.isBuilderTemplateSystem(entity)) {
            if (this._defaultChecked) {
                inputElement.attr('checked', 'checked');
            }

            jQElement.addClass('custom-system-editable-component');
            inputElement.addClass('custom-system-editable-field');

            jQElement.on('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                this.editComponent(entity);
            });
        }

        if (options.changeCallback) {
            inputElement.on('change', (ev) => {
                if (options.changeCallback) {
                    void options.changeCallback(ev, this.key, ev.target.checked);
                }
            });
        }

        return jQElement;
    }

    setDefaultValue(entity: AppliedTemplateSystem, _options: ComponentRenderOptions = {}): void {
        if (foundry.utils.getProperty(entity.system.props, this.key) === undefined) {
            foundry.utils.setProperty(entity.system.props, this.key, this._defaultChecked);
        }
    }

    /**
     * Returns serialized component
     */
    toJSON(): CheckboxJson {
        const jsonObj = super.toJSON();

        return {
            ...jsonObj,
            defaultChecked: this._defaultChecked
        };
    }

    /**
     * Creates checkbox from JSON description
     */
    static fromJSON(json: CheckboxJson, templateAddress: string, parent?: Container): Checkbox {
        return new Checkbox({
            ...json,

            parent: parent,
            templateAddress: templateAddress
        });
    }

    /**
     * Gets technical name for this component's type
     * @return The technical name
     * @throws {Error} If not implemented
     */
    static getTechnicalName(): string {
        return 'checkbox';
    }

    /**
     * Gets pretty name for this component's type
     * @returns The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName(): string {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.Checkbox');
    }

    /**
     * Get configuration form for component creation / edition
     * @returns The jQuery element holding the component
     */
    static async getConfigForm(
        _entity: TemplateSystem,
        appId: string,
        existingComponent: CheckboxJson & JSONObject
    ): Promise<HTMLElement> {
        const mainElt = document.createElement('div');

        mainElt.innerHTML = await foundry.applications.handlebars.renderTemplate(
            `systems/${game.system.id}/templates/_template/components/checkbox.hbs`,
            {
                ...existingComponent,
                COMPONENT_SIZES,
                appId
            }
        );

        mainElt.querySelector('[name="size"]')?.addEventListener('change', (event) => {
            const target = event.currentTarget as HTMLSelectElement;
            const customSizeBlock = $(mainElt.querySelector('.custom-system-size-custom')!);
            const slideValue = 200;

            switch (target.value) {
                case 'custom':
                    customSizeBlock.slideDown(slideValue);
                    break;
                default:
                    customSizeBlock.slideUp(slideValue);
                    break;
            }
        });

        return mainElt;
    }

    /**
     * Extracts configuration from submitted HTML form
     * @param html The submitted form
     * @returns The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(rawConfigData: ComponentConfigFormData, html: HTMLFormElement): CheckboxJson {
        const configData = <
            {
                defaultChecked?: boolean;
            }
        >rawConfigData;

        const fieldData: CheckboxJson = {
            ...super.extractConfig(configData, html),
            defaultChecked: configData.defaultChecked
        };

        return fieldData;
    }
}

/**
 * @ignore
 */
export default Checkbox;
