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

import { JSONObject, Primitive } from '../../definitions.js';
import TemplateSystem, { AppliedTemplateSystem } from '../../documents/TemplateSystem.js';
import { AlphanumericPatternError, RequiredFieldError } from '../../errors/ComponentValidationError.js';
import ComputableElement, { ComputeParameters } from '../../interfaces/ComputableElement.js';
import { ComponentConfigFormData, ComponentRenderOptions, ComponentValueType } from './Component.js';
import Container from './Container.js';
import InputComponent, {
    InputComponentJson,
    InputComponentProps,
    InputComponentRenderOptions
} from './InputComponent.js';
import { COMPONENT_SIZES } from './SizedComponent.js';

export type RadioButtonProps = InputComponentProps & {
    group: string;
    value: string;
    defaultChecked?: boolean;
};

export type RadioButtonJson = InputComponentJson & {
    group: string;
    value: string;
    defaultChecked?: boolean;
};

/**
 * Checkbox component
 * @ignore
 */
class RadioButton extends InputComponent implements ComputableElement {
    static valueType: ComponentValueType = 'string';

    /**
     * Radio button group
     */
    protected _group: string;

    /**
     * Radio button value
     */
    protected _value: string;

    /**
     * Radio button default state
     */
    protected _defaultChecked: boolean;

    /**
     * RadioButton constructor
     */
    constructor(props: RadioButtonProps) {
        super(props);

        this._group = props.group;
        this._value = props.value;
        this._defaultChecked = props.defaultChecked ?? false;
    }

    /**
     * Component property key
     */
    get propertyKey(): string {
        return this._group;
    }

    /**
     * Component default value
     */
    get defaultValue(): string | undefined {
        if (this._defaultChecked) {
            return this._value;
        }
    }

    /**
     * Renders component
     * @override
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user ?
     * @param options Additional options usable by the final Component
     * @return The jQuery element holding the component
     */
    async _getElement(
        entity: TemplateSystem,
        isEditable: boolean = true,
        options: InputComponentRenderOptions = {}
    ): Promise<JQuery> {
        const jQElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-radio');

        const inputElement = $<HTMLInputElement>('<input />');
        inputElement.attr('type', 'radio');
        inputElement.attr('id', this.getSluggedId(entity));

        if (TemplateSystem.isAppliedTemplateSystem(entity)) {
            const props = { ...entity.getRollData(), ...options.customProps };
            const value = this.computeButtonValue(entity, options);

            if (!options.noName) {
                inputElement.attr('name', 'system.props.' + this._group);
            }

            inputElement.attr('value', value);

            const radioGroupValue = foundry.utils.getProperty(props, this._group);

            if (radioGroupValue === value || (radioGroupValue === undefined && this._defaultChecked)) {
                inputElement.attr('checked', 'checked');
            }
        } else {
            if (this._defaultChecked) {
                inputElement.attr('checked', 'checked');
            }
        }

        if (!isEditable) {
            inputElement.attr('disabled', 'disabled');
        }

        jQElement.append(inputElement);

        if (TemplateSystem.isBuilderTemplateSystem(entity)) {
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
                    void options.changeCallback(ev, this._group, ev.target.value);
                }
            });
        }

        return jQElement;
    }

    private computeButtonValue(entity: AppliedTemplateSystem, options: ComponentRenderOptions = {}): string {
        const props = { ...entity.getRollData(), ...options.customProps };

        return ComputablePhrase.computeMessageStatic(this._value, props, {
            source: this.key,
            reference: options.reference,
            defaultValue: '',
            triggerEntity: entity
        }).result;
    }

    setDefaultValue(entity: AppliedTemplateSystem, options: ComponentRenderOptions = {}): void {
        if (foundry.utils.getProperty(entity.getRollData(), this.propertyKey) === undefined && this._defaultChecked) {
            const value = this.computeButtonValue(entity, options);

            foundry.utils.setProperty(entity.system.props, this.propertyKey, value);
        }
    }

    getComputeFunctions(
        entity: TemplateSystem,
        options?: ComponentRenderOptions,
        keyOverride?: string
    ): Array<ComputeParameters> {
        const computationKey = keyOverride ?? this.key;

        if (!computationKey) {
            return [];
        }

        return [
            {
                key: computationKey,
                formula: this._value ?? '',
                context: entity,
                options
            }
        ];
    }

    resetComputeValue(valueKeys: Array<string>): Record<string, Primitive> {
        const resetValues: Record<string, null> = {};

        for (const key of valueKeys) {
            foundry.utils.setProperty(resetValues, key, undefined);
        }

        return resetValues;
    }

    /**
     * Returns serialized component
     */
    toJSON(): RadioButtonJson {
        const jsonObj = super.toJSON();

        return {
            ...jsonObj,
            group: this._group,
            value: this._value,
            defaultChecked: this._defaultChecked
        };
    }

    /**
     * Creates component from JSON description
     */
    static fromJSON(json: RadioButtonJson, templateAddress: string, parent?: Container): RadioButton {
        return new RadioButton({
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
        return 'radioButton';
    }

    /**
     * Gets pretty name for this component's type
     * @returns The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName(): string {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.RadioButton');
    }

    /**
     * Get configuration form for component creation / edition
     */
    static async getConfigForm(
        _entity: TemplateSystem,
        appId: string,
        existingComponent?: RadioButtonJson & JSONObject
    ): Promise<HTMLElement> {
        const mainElt = document.createElement('div');

        mainElt.innerHTML = await foundry.applications.handlebars.renderTemplate(
            `systems/${game.system.id}/templates/_template/components/radioButton.hbs`,
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
    static extractConfig(rawConfigData: ComponentConfigFormData, html: HTMLFormElement): RadioButtonJson {
        const configData = <
            {
                group?: string;
                value?: string;
                defaultChecked?: boolean;
            }
        >rawConfigData;

        const fieldData: RadioButtonJson = {
            ...super.extractConfig(configData, html),
            group: configData.group ?? '',
            value: configData.value ?? '',
            defaultChecked: configData.defaultChecked
        };

        return fieldData;
    }

    static validateConfig(json: RadioButtonJson): void {
        super.validateConfig(json);

        if (!json.group) {
            throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.RadioButton.Group'), json);
        }
        if (!json.group.match(/^[a-zA-Z0-9_]+$/)) {
            throw new AlphanumericPatternError(game.i18n.localize('CSB.ComponentProperties.RadioButton.Group'), json);
        }
    }
}

/**
 * @ignore
 */
export default RadioButton;
