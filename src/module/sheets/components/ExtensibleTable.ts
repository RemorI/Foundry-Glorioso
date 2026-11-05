/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ComponentSettingsApplication from '../../applications/ComponentSettingsApplication.js';
import { DefinedPrimitive, Primitive } from '../../definitions.js';
import TemplateSystem, { AppliedTemplateSystem, BuilderTemplateSystem } from '../../documents/TemplateSystem.js';
import { RequiredFieldError } from '../../errors/ComponentValidationError.js';
import Logger from '../../Logger.js';
import { Alignment, getLocalizedAlignmentList } from '../../utils.js';
import Component, { ComponentConfigFormData, ComponentJson } from './Component.js';
import Container, { ComponentOptions, ContainerJson, ContainerProps } from './Container.js';

export enum COMPARISON_OPERATOR {
    GREATER_THAN = 'gt',
    GREATER_EQUALS = 'geq',
    EQUALS = 'eq',
    NOT_EQUALS = 'neq',
    LESSER_THAN = 'lt',
    LESSER_EQUALS = 'leq',
    FORMULA = 'formula'
}

export const SORT_OPERATORS = {
    [COMPARISON_OPERATOR.LESSER_THAN]: 'CSB.ComponentProperties.ExtensibleTable.SortOperator.Ascending',
    [COMPARISON_OPERATOR.GREATER_THAN]: 'CSB.ComponentProperties.ExtensibleTable.SortOperator.Descending',
    [COMPARISON_OPERATOR.EQUALS]: 'CSB.ComponentProperties.ExtensibleTable.SortOperator.Equals',
    [COMPARISON_OPERATOR.NOT_EQUALS]: 'CSB.ComponentProperties.ExtensibleTable.SortOperator.NotEquals'
};

export type SortOperator = keyof typeof SORT_OPERATORS;

export type SortPredicate = {
    prop: string;
    operator: SortOperator;
    value?: string;
};

export enum TABLE_SORT_OPTION {
    AUTO = 'auto',
    MANUAL = 'manual',
    DISABLED = 'disabled'
}

export const SIMPLE_TABLE_SORT_OPTIONS = {
    [TABLE_SORT_OPTION.MANUAL]: 'CSB.ComponentProperties.ExtensibleTable.Sort.Manual',
    [TABLE_SORT_OPTION.DISABLED]: 'CSB.ComponentProperties.ExtensibleTable.Sort.Disabled'
};

export type ExtensibleColumnData = {
    /** Component Alignment */
    align?: Alignment;
    /** Column name */
    colName?: string;
};

/**
 * JSON for the Extensible Tables Components
 */
export type ExtensibleColumnComponentJson = ComponentJson & ExtensibleColumnData;

export type ExtensibleColumnExtraConfig = {
    extraConf: ExtensibleColumnData;
};

/**
 * Extensible Tables Components additional props
 */
export type ExtensibleColumnProps = {
    /** Component Alignment */
    align?: Alignment;
    /** Column name */
    colName?: string;
};

/**
 * Extensible table props
 */
export type ExtensibleTableProps = ContainerProps & {
    /** Key is mandatory for Extensible Tables */
    key: string;
    /** Should the header row be emphasized? */
    head?: boolean;
    /** Extensible Table columns definition */
    rowLayout?: Record<string, ExtensibleColumnProps>;
    /** Should a warning be issued on row deletion? */
    deleteWarning?: boolean;
    /** Label to display when the table is empty */
    labelWhenEmpty?: string;
};

/**
 * JSON version of an Extensible Table
 */
export type ExtensibleTableJson = ContainerJson & {
    /** Key is mandatory for Extensible Tables */
    key: string;
    /** Should the header row be emphasized? */
    head?: boolean;
    /** Extensible Table columns definition */
    rowLayout?: Array<ExtensibleColumnComponentJson>;
    /** Should a warning be issued on row deletion? */
    deleteWarning?: boolean;
    /** Label to display when the table is empty */
    labelWhenEmpty?: string;
};

/**
 * Sort options for the table
 */
export type ColumnSortOption = {
    /** Property used for the sort */
    prop?: string;
    /** Direction of the sort */
    operator?: SortOperator;
    /**Saved order of the rows for manual sorting */
    savedOrder?: Array<string> | Array<number>;
};

export type HiddenColumn = {
    key: string;
    formula: string;
    isPredefined: boolean;
};

export type ExtensibleTableSystemProps = Record<string, Record<string, Primitive>>;

/**
 * ExtensibleTable abstract class
 * @abstract
 */
class ExtensibleTable extends Container {
    /**
     * Can container accept dropped components?
     */
    static readonly droppable: boolean = false;

    /**
     * Component key
     */
    protected _key: string;

    /**
     * Component key
     */
    get key(): string {
        return this._key;
    }

    /**
     * Table header should be bold
     */
    protected _head: boolean;

    /**
     * Row layout additional data
     */
    protected _rowLayout: Record<string, ExtensibleColumnProps>;

    /**
     * Display warning on row delete
     */
    protected _deleteWarning: boolean;

    /**
     *  Label to display when the table is empty
     */
    protected _labelWhenEmpty?: string;

    /**
     * Constructor
     * @param props Component data
     */
    constructor(props: ExtensibleTableProps) {
        super(props);
        this._key = props.key;
        this._head = props.head ?? true;
        this._rowLayout = props.rowLayout ?? {};
        this._deleteWarning = props.deleteWarning ?? true;
        this._labelWhenEmpty = props.labelWhenEmpty;
    }

    /**
     * Component property key
     * @override
     */
    get propertyKey(): string {
        return this.key;
    }

    /**
     * Swaps two dynamic table elements
     * @param entity Rendered entity (actor or item)
     * @param rowIdx1 Index of the first row to swap
     * @param rowIdx2 Index of the second row to swap
     */
    protected _swapElements(entity: AppliedTemplateSystem, rowIdx1: number, rowIdx2: number) {
        const tableProps = foundry.utils.getProperty(entity.getRollData(), this.key) as ExtensibleTableSystemProps;
        const tmpRow = {
            ...tableProps[rowIdx1]
        };

        tableProps[rowIdx1] = tableProps[rowIdx2];
        tableProps[rowIdx2] = tmpRow;

        void entity.entity.update({
            [`system.props.${this.key}`]: tableProps
        });
    }

    /**
     * Deletes a row from the Table
     * @param entity Entity containing the row
     * @param rowIdx Index of the row to delete
     */
    protected async _deleteRow(entity: AppliedTemplateSystem, rowIdx: number) {
        const keyPath = 'system.props.' + this.key;
        const tableProps = foundry.utils.getProperty(entity.getRollData(), this.key) as ExtensibleTableSystemProps;

        if (!(rowIdx in tableProps)) {
            Logger.error('Row index does not exist.');
            return;
        }

        const updateObj = {
            [keyPath]: {
                [`-=${rowIdx}`]: null
            }
        };
        await entity.entity.update(updateObj);
    }

    /**
     * Opens component editor
     * @param entity Rendered entity (actor or item)
     * @param options Component options
     * @param component
     */
    async openComponentEditor(
        entity: BuilderTemplateSystem,
        options: ComponentOptions = {},
        component?: Component
    ): Promise<ComponentSettingsApplication> {
        const allowedComponents = options.allowedComponents ?? [];

        const componentSettingsApp = new ComponentSettingsApplication(entity, this, {
            allowedComponents,
            options,
            component
        });

        const extensibleSettingsSection = document.createElement('div');
        extensibleSettingsSection.innerHTML = await foundry.applications.handlebars.renderTemplate(
            `systems/${game.system.id}/templates/_template/dialogs/componentExtensibleTableFields.hbs`,
            {
                component: component ? this._rowLayout[component.key!] : {},
                ALIGNMENT_LIST: getLocalizedAlignmentList(),
                appId: componentSettingsApp.id
            }
        );

        componentSettingsApp.addAdditionalConfigElement(extensibleSettingsSection.firstChild as HTMLElement);

        return componentSettingsApp.render({ force: true });
    }

    validateComponent(component: ComponentJson, _entity: TemplateSystem, originalComponent?: Component) {
        // TODO translate this
        if (!component.key) {
            throw new Error('Component key is mandatory in this Container.');
        }

        if (originalComponent?.key !== component.key && this._rowLayout[component.key]) {
            throw new Error("Component keys should be unique in the component's columns.");
        }
    }

    /**
     * Adds new component to container, handling rowLayout
     * @override
     * @param entity Rendered entity (actor or item)
     * @param component New component
     * @param _options Ignored
     */
    async addNewComponent(
        entity: TemplateSystem,
        component: (ComponentJson & ExtensibleColumnExtraConfig) | Array<ComponentJson & ExtensibleColumnExtraConfig>,
        _options: ComponentOptions = {}
    ) {
        if (!Array.isArray(component)) {
            component = [component];
        }

        for (const aComp of component) {
            if (this._rowLayout[aComp.key!]) {
                throw new Error("Component keys should be unique in the component's columns.");
            }
        }

        for (const aComponent of component) {
            // Add component
            this.contents.push(componentFactory.createOneComponent(aComponent, undefined, this));
            this._rowLayout[aComponent.key!] = {
                align: aComponent.extraConf.align,
                colName: aComponent.extraConf.colName
            };
        }

        this.recalculateAddresses(this.templateAddress);

        await this.save(entity);
    }

    /**
     *  @inheritdoc
     */
    replaceComponent(
        oldComponent: Component & ExtensibleColumnProps,
        newComponent: ComponentJson & ExtensibleColumnExtraConfig
    ) {
        super.replaceComponent(oldComponent, newComponent);

        this._rowLayout[newComponent.key!] = {
            align: newComponent.extraConf.align,
            colName: newComponent.extraConf.colName
        };

        if (oldComponent.key !== newComponent.key) {
            delete this._rowLayout[oldComponent.key!];
        }
    }

    /**
     * @inheritdoc
     */
    getComponentMap(): Record<string, Component> {
        const componentMap: Record<string, Component> = {};

        if (this.key) {
            componentMap[this.key] = this;
        }

        return componentMap;
    }

    /**
     * Returns serialized component
     * @override
     */
    toJSON(): ExtensibleTableJson {
        const jsonObj = super.toJSON();

        const rowLayout: Array<ExtensibleColumnComponentJson> = [];

        for (const component of jsonObj.contents ?? []) {
            rowLayout.push({
                ...component,
                align: this._rowLayout?.[component.key!].align ?? 'left',
                colName: this._rowLayout?.[component.key!].colName ?? ''
            });
        }

        return {
            ...jsonObj,
            key: this.key,
            rowLayout: rowLayout,
            head: this._head,
            deleteWarning: this._deleteWarning,
            labelWhenEmpty: this._labelWhenEmpty,
            contents: []
        };
    }

    /**
     * Extracts configuration from submitted HTML form
     * @override
     * @param configData
     * @param html The submitted form
     * @return The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(configData: ComponentConfigFormData, html: HTMLFormElement): ExtensibleTableJson {
        const superData = super.extractConfig(configData, html) as ContainerJson;

        return {
            ...superData,
            key: superData.key ?? ''
        };
    }

    static validateConfig(json: ExtensibleTableJson): void {
        super.validateConfig(json);

        if (!json.key) {
            throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.ComponentKey'), json);
        }
    }

    static getSortOrder(a: DefinedPrimitive, b: DefinedPrimitive, value: Primitive, operator: SortOperator): number {
        if (a === b) {
            return 0;
        }

        switch (operator) {
            case COMPARISON_OPERATOR.GREATER_THAN:
                if (typeof a === 'string' || typeof b === 'string') {
                    return -String(a).localeCompare(String(b));
                } else {
                    return a > b ? -1 : 1;
                }
            case COMPARISON_OPERATOR.LESSER_THAN:
                if (typeof a === 'string' || typeof b === 'string') {
                    return String(a).localeCompare(String(b));
                } else {
                    return a < b ? -1 : 1;
                }
            case COMPARISON_OPERATOR.NOT_EQUALS:
                return a !== value && b !== value ? 0 : a !== value ? -1 : 1;
            case COMPARISON_OPERATOR.EQUALS:
                // If both are equal to the value, both are equal to each other and it is handled above
                // If both are different from the value, return 0
                // Sorting here only if only one is equal
                return a !== value && b !== value ? 0 : a === value ? -1 : 1;
            default:
                return 0;
        }
    }
}

/**
 * @ignore
 */
export default ExtensibleTable;
