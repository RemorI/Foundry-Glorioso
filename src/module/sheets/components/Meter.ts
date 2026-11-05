/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { JSONObject, Primitive } from '../../definitions.js';
/**
 * @ignore
 * @module
 */
import TemplateSystem, { AppliedTemplateSystem } from '../../documents/TemplateSystem.js';
import { RequiredFieldError } from '../../errors/ComponentValidationError.js';
import { ComputablePhraseOptions } from '../../formulas/ComputablePhrase.js';
import AttributeBarElement from '../../interfaces/AttributeBarElement.js';
import ComputableElement, { ComputeParameters } from '../../interfaces/ComputableElement.js';
import Logger from '../../Logger.js';
import { ComponentConfigFormData, ComponentRenderOptions, ComponentValueType } from './Component.js';
import Container from './Container.js';
import SizedComponent, { COMPONENT_SIZES, SizedComponentJson, SizedComponentProps } from './SizedComponent.js';

const METER_TEXT_OPTIONS = {
    none: 'CSB.ComponentProperties.Meter.TextDisplay.None',
    showVal: 'CSB.ComponentProperties.Meter.TextDisplay.Value',
    showMax: 'CSB.ComponentProperties.Meter.TextDisplay.ValueAndMaximum',
    showPercent: 'CSB.ComponentProperties.Meter.TextDisplay.ValueAsPercentage'
};

type MeterTextOption = keyof typeof METER_TEXT_OPTIONS;

const textOptionDefault: MeterTextOption = 'none';

export type MeterProps = SizedComponentProps & {
    /** Label of the component */
    label?: string;

    value: string;
    min?: string;
    max?: string;
    low?: string;
    high?: string;
    optimum?: string;
    textOption?: MeterTextOption;
};

export type MeterJson = SizedComponentJson & {
    /** Label of the component */
    label?: string;

    value: string;
    min?: string;
    max?: string;
    low?: string;
    high?: string;
    optimum?: string;
    textOption?: MeterTextOption;
};

const METER_COLORS = {
    GOOD_VALUE: '#00AB60',
    BAD_VALUE: '#FFBD4F',
    WORSE_VALUE: '#E22850'
};

class Meter extends SizedComponent implements ComputableElement, AttributeBarElement {
    static valueType: ComponentValueType = 'none';

    /**
     * Component label
     */
    protected _label?: string;

    /**
     * Meter value formula
     */
    protected _value: string;

    /**
     * Minimum value formula
     */
    protected _min?: string;

    /**
     * Maximum value formula
     */
    protected _max?: string;

    /**
     * Low value formula
     */
    protected _low?: string;

    /**
     * High value formula
     */
    protected _high?: string;

    /**
     * Optimum value formula
     */
    protected _optimum?: string;

    /**
     * Text display option
     */
    protected _textOption: MeterTextOption;

    /**
     * Meter constructor
     */
    constructor(props: MeterProps) {
        super(props);

        this._label = props.label;
        this._value = props.value;
        this._min = props.min;
        this._max = props.max;
        this._low = props.low;
        this._high = props.high;
        this._optimum = props.optimum;
        this._textOption = props.textOption ?? textOptionDefault;
    }

    /**
     * Renders component
     * @override
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user ?
     * @param options Additional options usable by the final Component
     * @return The jQuery element holding the component
     */
    protected async _getElement(
        entity: TemplateSystem,
        isEditable: boolean = true,
        options: ComponentRenderOptions = {}
    ): Promise<JQuery> {
        const { customProps = {}, linkedEntity, reference } = options;

        const jQElement = await super._getElement(entity, isEditable, options);

        if (this._label) {
            const label = $('<label></label>');
            label.attr('for', this.getSluggedId(entity));
            label.text(this._label);
            jQElement.append(label);
        }

        const meterElement = $('<div></div>');
        meterElement.addClass('custom-system-meter');

        const meterFill = $('<span></span>');
        meterFill.addClass('custom-system-meter-fill');

        const meterText = $('<span></span>');
        meterText.addClass('custom-system-meter-content');

        meterElement.append(meterFill);
        meterElement.append(meterText);

        if (TemplateSystem.isBuilderTemplateSystem(entity)) {
            meterFill.css({ width: `50%`, 'background-color': METER_COLORS.GOOD_VALUE });

            switch (this._textOption) {
                case 'showVal':
                    meterText.text('50');
                    break;
                case 'showMax':
                    meterText.text('50 / 100');
                    break;
                case 'showPercent':
                    meterText.text('50%');
                    break;
            }

            jQElement.addClass('custom-system-editable-component');
            jQElement.on('click', () => {
                this.editComponent(entity);
            });
        } else if (TemplateSystem.isAppliedTemplateSystem(entity)) {
            const formulaProps = foundry.utils.mergeObject(entity.getRollData(), customProps, {
                inplace: false
            });

            let min = 0;
            if (this._min) {
                min = parseFloat(this._computeParam(this._min, entity, { ...options, source: `${this.key}.min` }));
            }

            let max = 100;
            if (this._max) {
                max = parseFloat(this._computeParam(this._max, entity, { ...options, source: `${this.key}.max` }));
            }

            let low;
            if (this._low) {
                low = parseFloat(this._computeParam(this._low, entity, { ...options, source: `${this.key}.low` }));
            }

            let high;
            if (this._high) {
                high = parseFloat(this._computeParam(this._high, entity, { ...options, source: `${this.key}.high` }));
            }

            let optimum;
            if (this._optimum) {
                optimum = parseFloat(
                    this._computeParam(this._optimum, entity, {
                        ...options,
                        source: `${this.key}.optimum`
                    })
                );
            }

            let meterValue = 0;
            // If Meter has a key, it was computed with the derivedData of the entity, no need to recompute it
            if (
                this.key &&
                foundry.utils.getProperty(formulaProps, this.key) !== null &&
                foundry.utils.getProperty(formulaProps, this.key) !== undefined
            ) {
                meterValue = foundry.utils.getProperty(formulaProps, this.key) as number;
                Logger.debug('Using precomputed value for ' + this.key + ' : ' + meterValue);
            } else {
                try {
                    meterValue = parseFloat(
                        (
                            await ComputablePhrase.computeMessage(this._value ?? '', formulaProps, {
                                source: `${this.key}`,
                                reference,
                                defaultValue: '',
                                triggerEntity: entity,
                                linkedEntity
                            })
                        ).result
                    );
                } catch (err) {
                    Logger.error((err as Error).message, err);
                    meterValue = 0;
                }
            }

            let color = METER_COLORS.GOOD_VALUE;

            if (optimum !== undefined) {
                if (low !== undefined && high !== undefined) {
                    if (optimum < low) {
                        if (meterValue > high) {
                            color = METER_COLORS.WORSE_VALUE;
                        } else if (meterValue > low) {
                            color = METER_COLORS.BAD_VALUE;
                        }
                    } else if (optimum > high) {
                        if (meterValue < low) {
                            color = METER_COLORS.WORSE_VALUE;
                        } else if (meterValue < high) {
                            color = METER_COLORS.BAD_VALUE;
                        }
                    } else {
                        if (meterValue < low || meterValue > high) {
                            color = METER_COLORS.BAD_VALUE;
                        }
                    }
                } else {
                    const gateValue = low ?? high;
                    if (gateValue !== undefined) {
                        if (optimum < gateValue && meterValue > gateValue) {
                            color = METER_COLORS.BAD_VALUE;
                        } else if (optimum > gateValue && meterValue < gateValue) {
                            color = METER_COLORS.BAD_VALUE;
                        }
                    }
                }
            } else {
                if (low !== undefined && meterValue < low) {
                    color = METER_COLORS.BAD_VALUE;
                }

                if (high !== undefined && meterValue > high) {
                    color = METER_COLORS.BAD_VALUE;
                }
            }

            const meterPercent = ((meterValue - min) * 100) / (max - min);
            meterFill.css({ width: `${meterPercent}%`, 'background-color': color });

            switch (this._textOption) {
                case 'showVal':
                    meterText.text(meterValue);
                    break;
                case 'showMax':
                    meterText.text(`${meterValue} / ${max}`);
                    break;
                case 'showPercent':
                    meterText.text(`${Math.round(meterPercent * 100) / 100}%`);
                    break;
            }
        }

        jQElement.append(meterElement);

        return jQElement;
    }

    protected _computeParam(valueFormula: string, entity: AppliedTemplateSystem, options?: ComponentRenderOptions) {
        const formulaProps = foundry.utils.mergeObject(entity.getRollData(), options?.customProps ?? {}, {
            inplace: false
        });

        return ComputablePhrase.computeMessageStatic(valueFormula, formulaProps, {
            ...options,
            defaultValue: 0,
            triggerEntity: entity
        }).result;
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

    getMaxValue(entity: AppliedTemplateSystem, options?: ComputablePhraseOptions, keyOverride?: string): number {
        return parseFloat(
            this._computeParam(this._max ?? '0', entity, {
                ...options,
                source: `${keyOverride ?? this.key}.max`
            })
        );
    }

    getValue(entity: AppliedTemplateSystem, _options?: ComputablePhraseOptions, keyOverride?: string): number {
        return entity.getRollData()[keyOverride ?? this.key!] as number;
    }

    public isEditable(): boolean {
        return false;
    }

    /**
     * Returns serialized component
     * @override
     */
    toJSON(): MeterJson {
        const jsonObj = super.toJSON();

        return {
            ...jsonObj,
            label: this._label,
            value: this._value,
            min: this._min,
            max: this._max,
            low: this._low,
            high: this._high,
            optimum: this._optimum,
            textOption: this._textOption,
            type: 'meter'
        };
    }

    /**
     * Creates meter from JSON description
     * @override
     */
    static fromJSON(json: MeterJson, templateAddress: string, parent?: Container): Meter {
        return new Meter({
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
        return 'meter';
    }

    /**
     * Gets pretty name for this component's type
     * @return The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName(): string {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.Meter');
    }

    /**
     * Get configuration form for component creation / edition
     * @return The jQuery element holding the component
     */
    static async getConfigForm(
        _entity: TemplateSystem,
        appId: string,
        existingComponent?: MeterJson & JSONObject
    ): Promise<HTMLElement> {
        const mainElt = document.createElement('div');

        const predefinedValuesComponent = { ...existingComponent };

        mainElt.innerHTML = await foundry.applications.handlebars.renderTemplate(
            `systems/${game.system.id}/templates/_template/components/meter.hbs`,
            {
                ...predefinedValuesComponent,
                COMPONENT_SIZES,
                METER_TEXT_OPTIONS,
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
     * @override
     * @param html The submitted form
     * @return The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(rawConfigData: ComponentConfigFormData, html: HTMLFormElement): MeterJson {
        const configData = <
            {
                label?: string;
                value?: string;
                min?: string;
                max?: string;
                low?: string;
                high?: string;
                optimum?: string;
                textOption?: MeterTextOption;
            }
        >rawConfigData;

        const fieldData: MeterJson = {
            ...super.extractConfig(configData, html),
            type: 'meter',
            label: configData.label,
            value: configData.value ?? '',
            min: configData.min,
            max: configData.max,
            low: configData.low,
            high: configData.high,
            optimum: configData.optimum,
            textOption: configData.textOption ?? textOptionDefault
        };

        return fieldData;
    }

    static validateConfig(json: MeterJson): void {
        super.validateConfig(json);

        if (json.value === '') {
            throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.Meter.Value'), json);
        }
    }
}

/**
 * @ignore
 */
export default Meter;
