/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Primitive } from '../../definitions.js';
import TemplateSystem from '../../documents/TemplateSystem.js';
import { RequiredFieldError } from '../../errors/ComponentValidationError.js';
import { ComponentConfigFormData, ComponentRenderOptions, ComponentValueType } from './Component.js';
import SizedComponent, { SizedComponentJson, SizedComponentProps } from './SizedComponent.js';

export type InputComponentRenderOptions = ComponentRenderOptions & {
    /** The value to use when rendering instead of the entity value */
    overrideValue?: Primitive;
};

/**
 * Input Component properties
 */
export type InputComponentProps = SizedComponentProps & {
    /** Label of the component */
    label?: string;
    /** Default value */
    defaultValue?: string;
};

export type InputComponentJson = SizedComponentJson & {
    /** Label of the component */
    label?: string;
    /** Default value */
    defaultValue?: string;
};

/**
 * Abstract class for Components which serve as inputs
 * @abstract
 */
abstract class InputComponent extends SizedComponent {
    declare _key: string;

    get key(): string {
        return this._key;
    }

    /**
     * @inheritdoc
     */
    static valueType: ComponentValueType = 'string';

    /**
     * Component label
     */
    protected _label?: string;

    /**
     * Component default value
     */
    protected _defaultValue?: string;

    /**
     * Constructor
     * @param props Component data
     */
    constructor(props: InputComponentProps) {
        super(props);

        if (this.constructor === InputComponent) {
            throw new TypeError('Abstract class "InputComponent" cannot be instantiated directly');
        }

        this._label = props.label;
        this._defaultValue = props.defaultValue;
    }

    /**
     * Component property key
     * @override
     */
    get propertyKey(): string | undefined {
        return this.key;
    }

    /**
     * Field label
     */
    get label(): string | undefined {
        return this._label;
    }

    /**
     * Field default value
     */
    get defaultValue(): string | undefined {
        return this._defaultValue;
    }

    async render(
        entity: TemplateSystem,
        isEditable: boolean = true,
        options: InputComponentRenderOptions = {}
    ): Promise<JQuery> {
        return super.render(entity, isEditable, options);
    }

    /**
     * Renders the outer part of an input component, including the label if exists
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user?
     * @param options Additional options usable by the final Component
     * @return The jQuery element holding the component
     */
    protected async _getElement(
        entity: TemplateSystem,
        isEditable: boolean = true,
        options: InputComponentRenderOptions = {}
    ): Promise<JQuery> {
        const jQElement = await super._getElement(entity, isEditable, options);

        if (this.label) {
            const label = $('<label></label>');
            label.attr('for', this.getSluggedId(entity));
            label.text(this.label);
            jQElement.append(label);
        }

        return jQElement;
    }

    /**
     * Returns serialized component
     * @override
     */
    toJSON(): InputComponentJson {
        const jsonObj = super.toJSON();
        return {
            ...jsonObj,
            label: this.label,
            defaultValue: this._defaultValue
        };
    }

    /**
     * Extracts configuration from submitted HTML form
     * @param html The submitted form
     * @return The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(rawConfigData: ComponentConfigFormData, html: HTMLFormElement): InputComponentJson {
        const configData = <
            {
                label?: string;
                defaultValue?: string;
            }
        >rawConfigData;

        const fieldData: InputComponentJson = {
            ...super.extractConfig(configData, html),
            label: configData.label,
            defaultValue: configData.defaultValue
        };

        return fieldData;
    }

    /**
     * Validates if the passed JSON-Object meets all criteria for Component creation.
     * Can be overridden by each Component's subclass.
     * @param json The new Component's JSON
     * @throws {ComponentValidationError} If configuration contains validation errors
     */
    static validateConfig(json: InputComponentJson): void {
        super.validateConfig(json);

        if (!json.key) {
            throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.ComponentKey'), json);
        }
    }
}

/**
 * @ignore
 */
export default InputComponent;
