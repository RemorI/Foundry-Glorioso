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

import { JSONValue } from 'fvtt-types/utils';

import { isAppliedTemplateEntity, JSONObject } from '../../definitions.js';
import TemplateSystem, { AppliedTemplateSystem } from '../../documents/TemplateSystem.js';
import { ComponentValidationError, RequiredFieldError } from '../../errors/ComponentValidationError.js';
import { ComponentConfigFormData, ComponentRenderOptions } from './Component.js';
import Container from './Container.js';
import InputComponent, {
    InputComponentJson,
    InputComponentProps,
    InputComponentRenderOptions
} from './InputComponent.js';
import { COMPONENT_SIZES } from './SizedComponent.js';

export type DropdownProps = InputComponentProps & {
    selectedOptionType?: 'custom' | 'table' | 'formula';
    options?: {
        key: string;
        value: string;
    }[];
    tableKey?: string;
    tableKeyColumn?: string;
    tableLabelColumn?: string;
    formulaKeyOptions?: string;
    formulaLabelOptions?: string;
};

export type DropdownJson = InputComponentJson & {
    selectedOptionType?: 'custom' | 'table' | 'formula';
    options?: {
        key: string;
        value: string;
    }[];
    tableKey?: string;
    tableKeyColumn?: string;
    tableLabelColumn?: string;
    formulaKeyOptions?: string;
    formulaLabelOptions?: string;
};

/**
 * Dropdown component
 * @ignore
 */
class Dropdown extends InputComponent {
    protected _selectedOptionType: 'custom' | 'table' | 'formula';

    /** Options */
    protected _options: Array<{ key: string; value: string }>;

    /** Dynamic table key */
    protected _tableKey?: string;

    /** Key of the column to use as options keys */
    protected _tableKeyColumn?: string;

    /** Key of the column to use as labels */
    protected _tableLabelColumn?: string;

    /** Formula of the column to use as options keys */
    protected _formulaKeyOptions?: string;

    /** Formula of the column to use as labels */
    protected _formulaLabelOptions?: string;

    /** Dropdown constructor */
    constructor(props: DropdownProps) {
        super(props);
        this._selectedOptionType = props.selectedOptionType ?? 'custom';
        this._options = props.options ?? [];
        this._tableKey = props.tableKey;
        this._tableKeyColumn = props.tableKeyColumn;
        this._tableLabelColumn = props.tableLabelColumn;
        this._formulaKeyOptions = props.formulaKeyOptions;
        this._formulaLabelOptions = props.formulaLabelOptions;
    }

    get key(): string {
        return this._key;
    }

    /**
     * Renders component
     * @override
     * @param {TemplateSystem} entity Rendered entity (actor or item)
     * @param {boolean} [isEditable=true] Is the component editable by the current user ?
     * @param {InputComponentRenderOptions} [options={}] Additional options usable by the final Component
     * @return {Promise<JQuery>} The jQuery element holding the component
     */
    async _getElement(
        entity: TemplateSystem,
        isEditable: boolean = true,
        options: InputComponentRenderOptions = {}
    ): Promise<JQuery> {
        const { reference } = options;
        const props = { ...entity.getRollData(), ...options.customProps };

        const jQElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-select');

        const selectElement = $<HTMLSelectElement>('<select />');
        selectElement.attr('id', this.getSluggedId(entity));

        if (!this.defaultValue) {
            const emptyOption = $('<option></option>');
            emptyOption.attr('value', '');
            selectElement.append(emptyOption);
        }

        const optionKeys: Set<string> = new Set();

        if (TemplateSystem.isAppliedTemplateSystem(entity)) {
            if (!options.noName) {
                selectElement.attr('name', 'system.props.' + this.key);
            }

            if (!isEditable) {
                selectElement.attr('disabled', 'disabled');
            }

            if (this._selectedOptionType === 'table') {
                let baseProps = entity.getRollData();
                let tableKey = this._tableKey!;

                if (
                    tableKey.startsWith('parent.') &&
                    entity.entity.parent &&
                    isAppliedTemplateEntity(entity.entity.parent)
                ) {
                    baseProps = entity.entity.parent.getRollData();
                    tableKey = tableKey.split('.', 2)[1];
                }

                const dynamicProps = foundry.utils.getProperty(baseProps, tableKey) as Record<
                    string,
                    Record<string, JSONValue>
                >;

                if (dynamicProps) {
                    for (const rowIndex in dynamicProps) {
                        if (dynamicProps[rowIndex] && !dynamicProps[rowIndex]?.$deleted) {
                            const optionElement = this._generateOption(
                                optionKeys,
                                String(dynamicProps[rowIndex][this._tableKeyColumn!]),
                                this._tableLabelColumn
                                    ? String(dynamicProps[rowIndex][this._tableLabelColumn])
                                    : String(dynamicProps[rowIndex][this._tableKeyColumn!])
                            );

                            if (optionElement) {
                                selectElement.append(optionElement);
                            }
                        }
                    }
                }
            } else if (this._selectedOptionType === 'formula' && TemplateSystem.isAppliedTemplateSystem(entity)) {
                const keyOptions = (
                    await ComputablePhrase.computeMessage(this._formulaKeyOptions!, props, {
                        ...options,
                        source: `${this.key}.keyOptions`,
                        reference,
                        defaultValue: '',
                        triggerEntity: entity
                    })
                ).result.split(',');
                const labelOptions = (
                    await ComputablePhrase.computeMessage(this._formulaLabelOptions ?? '', props, {
                        ...options,
                        source: `${this.key}.labelOptions`,
                        reference,
                        defaultValue: '',
                        triggerEntity: entity
                    })
                ).result.split(',');

                if (labelOptions[0] !== '' && keyOptions.length !== labelOptions.length) {
                    ui.notifications.error(
                        game.i18n.format('CSB.UserMessages.Dropdown.OptionsLengthError', {
                            COMPONENT_KEY: this.key
                        })
                    );
                } else {
                    for (let i = 0; i < keyOptions.length; i++) {
                        const optionElement = this._generateOption(
                            optionKeys,
                            keyOptions[i],
                            labelOptions[0] === '' ? keyOptions[i] : labelOptions[i]
                        );

                        if (optionElement) {
                            selectElement.append(optionElement);
                        }
                    }
                }
            } else {
                for (const option of this._options) {
                    const optionElement = this._generateOption(optionKeys, option.key, option.value);

                    if (optionElement) {
                        selectElement.append(optionElement);
                    }
                }
            }

            const selectedValue =
                (foundry.utils.getProperty(props, this.key) as string | undefined) ??
                ComputablePhrase.computeMessageStatic(this.defaultValue ?? '', props, {
                    source: this.key,
                    reference,
                    defaultValue: '',
                    triggerEntity: entity
                }).result;

            selectElement.val(
                optionKeys.has(selectedValue) ? selectedValue : selectElement.find('option:first').val()!
            );
        }

        jQElement.append(selectElement);

        if (TemplateSystem.isBuilderTemplateSystem(entity)) {
            jQElement.addClass('custom-system-editable-component');
            selectElement.addClass('custom-system-editable-field');

            jQElement.on('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                this.editComponent(entity);
            });
        }

        if (options.changeCallback) {
            selectElement.on('change', (ev) => {
                if (options.changeCallback) {
                    void options.changeCallback(ev, this.key, ev.target.value);
                }
            });
        }

        return jQElement;
    }

    setDefaultValue(entity: AppliedTemplateSystem, options: ComponentRenderOptions = {}): void {
        if (foundry.utils.getProperty(entity.getRollData(), this.key) === undefined && this.defaultValue) {
            const props = { ...entity.getRollData(), ...options.customProps };

            foundry.utils.setProperty(
                entity.system.props,
                this.key,
                ComputablePhrase.computeMessageStatic(this.defaultValue, props, {
                    source: `${this.key}.defaultValue`,
                    reference: options.reference,
                    defaultValue: '',
                    triggerEntity: entity
                }).result
            );
        }
    }

    /** Returns serialized component */
    toJSON(): DropdownJson {
        const jsonObj = super.toJSON();

        return {
            ...jsonObj,
            selectedOptionType: this._selectedOptionType,
            options: this._options,
            tableKey: this._tableKey,
            tableKeyColumn: this._tableKeyColumn,
            tableLabelColumn: this._tableLabelColumn,
            formulaKeyOptions: this._formulaKeyOptions,
            formulaLabelOptions: this._formulaLabelOptions
        };
    }

    /** Creates Dropdown from JSON description */
    static fromJSON(json: DropdownJson, templateAddress: string, parent?: Container): Dropdown {
        return new Dropdown({
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
        return 'select';
    }

    /**
     * Gets pretty name for this component's type
     * @returns The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName(): string {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.Dropdown');
    }

    /** Get configuration form for component creation / edition */
    static async getConfigForm(
        _entity: TemplateSystem,
        appId: string,
        existingComponent?: DropdownJson & JSONObject
    ): Promise<HTMLElement> {
        const predefinedValues = { ...existingComponent };
        predefinedValues.selectedOptionType = predefinedValues.selectedOptionType ?? 'custom';

        const mainElt = document.createElement('div');

        mainElt.innerHTML = await foundry.applications.handlebars.renderTemplate(
            `systems/${game.system.id}/templates/_template/components/dropdown.hbs`,
            {
                ...predefinedValues,
                COMPONENT_SIZES,
                appId
            }
        );

        mainElt.addEventListener('click', (event) => {
            const target = (event.target as HTMLElement).closest<HTMLElement>('.custom-system-delete-option');

            if (target) {
                const row = target.closest('tr');
                // Remove it from the DOM
                row!.remove();
            }
        });

        mainElt.querySelector('.addOption')?.addEventListener('click', (event) => {
            const target = event.currentTarget as HTMLElement;

            // Create new row
            const newRow = mainElt
                .querySelector<HTMLTemplateElement>('.custom-system-dropdown-option-template')
                ?.content.cloneNode(true) as HTMLElement;

            const newIndex = String(
                parseInt(
                    (
                        Array.from(
                            target
                                .closest('.custom-system-form-field')!
                                .querySelectorAll('.custom-system-dropdown-option')
                        )?.pop() as HTMLTableRowElement
                    )?.dataset?.index ?? '-1'
                ) + 1
            );

            newRow.querySelector<HTMLElement>('.custom-system-dropdown-option')!.dataset.index = newIndex;
            newRow.querySelector<HTMLInputElement>('.custom-system-dropdown-option-key')!.name =
                `optionKeys.${newIndex}`;
            newRow.querySelector<HTMLInputElement>('.custom-system-dropdown-option-value')!.name =
                `optionValues.${newIndex}`;

            // Insert new row
            target.closest('table')?.querySelector('tbody')?.append(newRow);
        });

        mainElt.querySelectorAll("input[name='dropdownOptionMode']").forEach((elt) => {
            elt.addEventListener('change', (event) => {
                const target = event.currentTarget as HTMLInputElement;
                const customOptions = $('.custom-system-custom-options');
                const dynamicTableOptions = $('.custom-system-dynamic-options');
                const formulaOptions = $('.custom-system-formula-options');
                const slideValue = 200;

                console.log('Selected ' + target.value);

                switch (target.value) {
                    case 'custom':
                        customOptions.slideDown(slideValue);
                        dynamicTableOptions.slideUp(slideValue);
                        formulaOptions.slideUp(slideValue);
                        break;
                    case 'table':
                        customOptions.slideUp(slideValue);
                        dynamicTableOptions.slideDown(slideValue);
                        formulaOptions.slideUp(slideValue);
                        break;
                    case 'formula':
                        customOptions.slideUp(slideValue);
                        dynamicTableOptions.slideUp(slideValue);
                        formulaOptions.slideDown(slideValue);
                        break;
                }
            });
        });

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
     * @param {JQuery} html The submitted form
     * @return {DropdownJson} The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(rawConfigData: ComponentConfigFormData, html: HTMLFormElement): DropdownJson {
        const configData = <
            {
                dropdownOptionMode?: 'custom' | 'table' | 'formula';
                optionKeys?: Record<string, string>;
                optionValues?: Record<string, string>;

                tableKey?: string;
                tableKeyColumn?: string;
                tableLabelColumn?: string;

                formulaKeyOptions?: string;
                formulaLabelOptions?: string;
            }
        >rawConfigData;

        const options: { key: string; value: string }[] = [];
        const selectedOptionType = configData.dropdownOptionMode ?? 'custom';

        let tableKey;
        let tableKeyColumn;
        let tableLabelColumn;
        let formulaKeyOptions;
        let formulaLabelOptions;

        switch (selectedOptionType) {
            case 'custom': {
                const optionKeys: Record<string, string> = configData.optionKeys ?? {};
                const optionValues: Record<string, string> = configData.optionValues ?? {};

                Object.entries(optionKeys).forEach(([idx, key]) => {
                    options.push({
                        key,
                        value: optionValues[idx]
                    });
                });
                break;
            }
            case 'table':
                tableKey = configData.tableKey;
                tableKeyColumn = configData.tableKeyColumn;
                tableLabelColumn = configData.tableLabelColumn;
                break;
            case 'formula':
                formulaKeyOptions = configData.formulaKeyOptions;
                formulaLabelOptions = configData.formulaLabelOptions;
                break;
        }

        const fieldData: DropdownJson = {
            ...super.extractConfig(configData, html),
            selectedOptionType: selectedOptionType,
            options: options,
            tableKey: tableKey,
            tableKeyColumn: tableKeyColumn,
            tableLabelColumn: tableLabelColumn,
            formulaKeyOptions: formulaKeyOptions,
            formulaLabelOptions: formulaLabelOptions
        };

        return fieldData;
    }

    static validateConfig(json: DropdownJson): void {
        super.validateConfig(json);

        switch (json.selectedOptionType) {
            case 'custom':
                json.options ??= [];
                json.options.forEach((option) => {
                    if (option.key === '') {
                        throw new ComponentValidationError(
                            game.i18n.localize('CSB.ComponentProperties.Errors.DropdownOptionValidationError'),
                            'options',
                            json
                        );
                    }
                });
                break;
            case 'formula':
                if (!json.formulaKeyOptions) {
                    throw new RequiredFieldError(
                        game.i18n.localize('CSB.ComponentProperties.Dropdown.OptionsOrigin.FormulaForKeyOption'),
                        json
                    );
                }
                break;
            case 'table':
                if (!json.tableKey) {
                    throw new RequiredFieldError(
                        game.i18n.localize('CSB.ComponentProperties.Dropdown.OptionsOrigin.DynamicTableKey'),
                        json
                    );
                }

                if (!json.tableKeyColumn) {
                    throw new RequiredFieldError(
                        game.i18n.localize('CSB.ComponentProperties.Dropdown.OptionsOrigin.DynamicTableOptionKey'),
                        json
                    );
                }
                break;
        }
    }

    /**
     * Generates an option for the provided collection
     * @param collection {Set}
     * @param key {String}
     * @param value {String}
     * @returns {JQuery}
     * @private
     */
    _generateOption(collection: Set<string>, key: string, value: string): JQuery | undefined {
        if (!collection.has(key)) {
            const optionElement = $('<option></option>');
            collection.add(key);
            optionElement.attr('value', key);
            optionElement.text(value === '' ? key : value);

            return optionElement;
        }
    }
}

/**
 * @ignore
 */
export default Dropdown;
