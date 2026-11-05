/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import TemplateSystem from '../../documents/TemplateSystem.js';
import { ComponentValidationError } from '../../errors/ComponentValidationError.js';
import Component, {
    ComponentConfigFormData,
    ComponentJson,
    ComponentProps,
    ComponentRenderOptions
} from './Component.js';

export const COMPONENT_SIZES = {
    'full-size': 'CSB.ComponentProperties.Size.Auto',
    'x-small': 'CSB.ComponentProperties.Size.Tiny',
    small: 'CSB.ComponentProperties.Size.Smaller',
    'm-small': 'CSB.ComponentProperties.Size.Small',
    medium: 'CSB.ComponentProperties.Size.Medium',
    'm-large': 'CSB.ComponentProperties.Size.Large',
    large: 'CSB.ComponentProperties.Size.Larger',
    'x-large': 'CSB.ComponentProperties.Size.Gigantic',
    custom: 'CSB.ComponentProperties.Size.Custom'
};

export type ComponentSize = keyof typeof COMPONENT_SIZES;

/**
 * Input Component properties
 */
export type SizedComponentProps = ComponentProps & {
    /** Size of the component */
    size?: ComponentSize;
    /** Custom size of the component */
    customSize?: number;
};

export type SizedComponentJson = ComponentJson & {
    /** Size of the component */
    size?: ComponentSize;
    /** Custom size of the component */
    customSize?: number;
};

/**
 * Abstract class for Components which serve as inputs
 * @abstract
 */
abstract class SizedComponent extends Component {
    /**
     * Component size
     */
    protected _size: ComponentSize;

    /**
     * Component custom size
     */
    protected _customSize?: number;

    /**
     * Constructor
     * @param props Component data
     */
    constructor(props: SizedComponentProps) {
        super(props);

        if (this.constructor === SizedComponent) {
            throw new TypeError('Abstract class "SizedComponent" cannot be instantiated directly');
        }

        this._size = props.size ?? 'full-size';
        this._customSize = props.customSize;
    }

    /**
     * Field size
     */
    get size(): ComponentSize {
        return this._size;
    }

    /**
     * Field custom size
     */
    get customSize(): number | undefined {
        return this._customSize;
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
        options: ComponentRenderOptions = {}
    ): Promise<JQuery> {
        const jQElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass(
            'custom-system-field custom-system-field-root custom-system-field-' + (this.size ?? 'full-size')
        );

        if (this.size === 'custom') {
            jQElement.css({ width: `${this.customSize}px` });
        }

        return jQElement;
    }

    /**
     * Returns serialized component
     * @override
     */
    toJSON(): SizedComponentJson {
        const jsonObj = super.toJSON();
        return {
            ...jsonObj,
            size: this.size,
            customSize: this.customSize
        };
    }

    /**
     * Extracts configuration from submitted HTML form
     * @param html The submitted form
     * @return The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(rawConfigData: ComponentConfigFormData, html: HTMLFormElement): SizedComponentJson {
        const configData = <
            {
                size?: ComponentSize;
                customSize?: number;
            }
        >rawConfigData;

        const fieldData: SizedComponentJson = {
            ...super.extractConfig(configData, html),
            size: configData.size ?? 'full-size'
        };

        if (fieldData.size === 'custom') {
            fieldData.customSize = configData.customSize ?? 50;
        }

        return fieldData;
    }

    /**
     * Validates if the passed JSON-Object meets all criteria for Component creation.
     * Can be overridden by each Component's subclass.
     * @param json The new Component's JSON
     * @throws {ComponentValidationError} If configuration contains validation errors
     */
    static validateConfig(json: SizedComponentJson): void {
        super.validateConfig(json);

        if (json.size === 'custom' && (!json.customSize || isNaN(json.customSize) || json.customSize < 5)) {
            throw new ComponentValidationError(
                game.i18n.localize('CSB.ComponentProperties.SizedComponent.CustomSizeInvalid'),
                'customSize',
                json
            );
        }
    }
}

/**
 * @ignore
 */
export default SizedComponent;
