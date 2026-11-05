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
import CustomItem from '../../documents/CustomItem.js';
import TemplateSystem, { AppliedTemplateSystem } from '../../documents/TemplateSystem.js';
import Formula, { FormulaOptions } from '../../formulas/Formula.js';
import ChatSenderElement, { ChatSenderMap, isChatSenderElement } from '../../interfaces/ChatSenderElement.js';
import ComputableElement, {
    ComputeFunction,
    ComputeParameters,
    isComputableElement
} from '../../interfaces/ComputableElement.js';
import Logger from '../../Logger.js';
import {
    Alignment,
    castToPrimitive,
    fastSetFlag,
    getGameCollectionAsTemplateSystems,
    getLocalizedAlignmentList
} from '../../utils.js';
import Component, { ComponentConfigFormData, ComponentRenderOptions } from './Component.js';
import Container from './Container.js';
import ExtensibleTable, {
    ColumnSortOption,
    ExtensibleTableJson,
    ExtensibleTableProps,
    ExtensibleColumnProps,
    SortPredicate,
    TABLE_SORT_OPTION,
    COMPARISON_OPERATOR,
    SORT_OPERATORS,
    SortOperator,
    HiddenColumn
} from './ExtensibleTable.js';
import Label from './Label.js';
import Meter from './Meter.js';
import MirrorComponent from './MirrorComponent.js';
import SizedComponent from './SizedComponent.js';

export type ItemContainerProps = ExtensibleTableProps & {
    title?: string;
    hideEmpty?: boolean;
    headDisplay?: boolean;
    hiddenColumns?: HiddenColumn[];
    sortOption?: TABLE_SORT_OPTION;
    templateFilter?: Array<string>;
    itemFilterFormula?: string;
    sortPredicates?: Array<SortPredicate>;
    showCreate?: boolean;
    defaultTemplate?: string;
    createItemDialogTitle?: string;
    createItemDialogButton?: string;
    createItemDialogShowTemplateList?: boolean;
    newItemDefaultName?: string;
    showDelete?: boolean;
    statusIcon?: boolean;
    nameAlign?: Alignment;
    nameLabel?: string;
};

export type ItemContainerJson = ExtensibleTableJson & {
    title?: string;
    hideEmpty?: boolean;
    hiddenColumns?: HiddenColumn[];
    sortOption?: TABLE_SORT_OPTION;
    headDisplay?: boolean;
    showCreate?: boolean;
    defaultTemplate?: string;
    createItemDialogTitle?: string;
    createItemDialogShowTemplateList?: boolean;
    createItemDialogButton?: string;
    newItemDefaultName?: string;
    showDelete?: boolean;
    statusIcon?: boolean;
    nameAlign?: Alignment;
    nameLabel?: string;
    templateFilter?: Array<string>;
    itemFilterFormula?: string;
    sortPredicates?: Array<SortPredicate>;
};

const defaultNameAlign: Alignment = 'left';

/**
 * Class ItemContainer
 * @ignore
 */
class ItemContainer extends ExtensibleTable implements ComputableElement, ChatSenderElement {
    static ALLOWED_COMPONENTS = [
        Label.getTechnicalName(),
        Meter.getTechnicalName(),
        MirrorComponent.getTechnicalName()
    ];

    private static getPredefinedHiddenColumns(): HiddenColumn[] {
        return [
            {
                key: 'name',
                formula: '${item.name}$',
                isPredefined: true
            },
            {
                key: 'id',
                formula: '${item.id}$',
                isPredefined: true
            },
            {
                key: 'uuid',
                formula: '${item.uuid}$',
                isPredefined: true
            }
        ];
    }

    /**
     * Table title
     */
    protected _title?: string;

    /**
     * Table should be hidden if empty
     */
    protected _hideEmpty: boolean;

    /**
     * Table header should be displayed
     */
    protected _headDisplay: boolean;

    /**
     * Hidden columns containing computable fields
     */
    protected _hiddenColumns: HiddenColumn[];

    /**
     * Which sort option should be applied
     */
    protected _sortOption: TABLE_SORT_OPTION;

    /**
     * Sort predicates
     */
    protected _sortPredicates: Array<SortPredicate>;

    /**
     * Which templates can be displayed
     */
    protected _templateFilter: Array<string>;

    /**
     * Additional filter rules as Formula
     */
    protected _itemFilterFormula?: string;

    /**
     * Show create button
     */
    protected _showCreate: boolean;

    /**
     * Default item template on creation from this item container
     */
    protected _defaultTemplate?: string;

    /**
     * Title of the item creation dialog
     */
    protected _createItemDialogTitle?: string;

    /**
     * SHould the creation dialog show every eligible template ?
     */
    protected _createItemDialogShowTemplateList: boolean;

    /**
     * Label of the button of the item creation dialog
     */
    protected _createItemDialogButton?: string;

    /**
     * Default name of new items
     */
    protected _newItemDefaultName?: string;

    /**
     * Show delete button
     */
    protected _showDelete: boolean;

    /**
     * Show item status icon
     */
    protected _statusIcon: boolean;

    /**
     * Alignment of the item reference column
     */
    protected _nameAlign: Alignment;

    /**
     * Label of the item reference column
     */
    protected _nameLabel: string;

    /**
     * ItemContainer constructor
     */
    constructor(props: ItemContainerProps) {
        super(props);

        this._title = props.title;
        this._hideEmpty = props.hideEmpty ?? false;
        this._headDisplay = props.headDisplay ?? true;
        this._hiddenColumns = props.hiddenColumns ?? [];
        this._sortOption = props.sortOption ?? TABLE_SORT_OPTION.MANUAL;
        this._templateFilter = props.templateFilter ?? [];
        this._itemFilterFormula = props.itemFilterFormula;
        this._sortPredicates = props.sortPredicates ?? [];
        this._showCreate = props.showCreate ?? false;
        this._defaultTemplate = props.defaultTemplate;
        this._createItemDialogTitle = props.createItemDialogTitle;
        this._createItemDialogShowTemplateList = props.createItemDialogShowTemplateList ?? false;
        this._createItemDialogButton = props.createItemDialogButton;
        this._newItemDefaultName = props.newItemDefaultName;
        this._showDelete = props.showDelete ?? true;
        this._statusIcon = props.statusIcon ?? true;
        this._nameAlign = props.nameAlign ?? defaultNameAlign;
        this._nameLabel = props.nameLabel ?? '';
    }

    /**
     * @returns {boolean}
     */
    get canPlayerAdd(): boolean {
        return this._showCreate && game.user.hasPermission('ITEM_CREATE');
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
        const jQElement = await super._getElement(entity, isEditable, options);

        let relevantItems: Array<CustomItem<'equippableItem'>> = [];

        if (TemplateSystem.isAppliedTemplateSystem(entity)) {
            relevantItems = this.filterItems(entity, options);
            relevantItems = this._sortItems(relevantItems, entity);

            fastSetFlag(
                game.system.id,
                entity.uuid + '.' + this.templateAddress + '.sortOption.savedOrder',
                relevantItems.map((item) => item.id)
            );
        }

        if (
            !TemplateSystem.isBuilderTemplateSystem(entity) &&
            !this._headDisplay &&
            !this._showDelete &&
            this.contents.length === 0
        ) {
            jQElement.addClass('flexcol flex-group-no-stretch');

            switch (this._nameAlign) {
                case 'center':
                    jQElement.addClass('flex-group-center');
                    break;
                case 'right':
                    jQElement.addClass('flex-group-right');
                    break;
                case 'left':
                default:
                    jQElement.addClass('flex-group-left');
                    break;
            }

            for (const item of relevantItems) {
                jQElement.append(this._generateItemLink(item));
            }
        } else {
            const entityIsTemplate = TemplateSystem.isBuilderTemplateSystem(entity);
            const columnsVisibility: Record<string, { column?: HTMLTableCellElement; visible: boolean }> =
                Object.fromEntries(
                    this.contents.map((component) => {
                        return [component.key!, { visible: entityIsTemplate }];
                    })
                );

            const tableElement = $('<table></table>');

            if (!entityIsTemplate && this._hideEmpty && relevantItems.length === 0) {
                tableElement.addClass('hidden');
            }

            if (this._title) {
                const captionElement = $('<caption></caption>');

                if (TemplateSystem.isBuilderTemplateSystem(entity) && this.escapeHTML) {
                    captionElement.text(this._title ?? '');
                } else {
                    captionElement.append(this._title ?? '');
                }

                tableElement.append(captionElement);
            }

            const tableBody = $('<tbody></tbody>');

            if (this._headDisplay || entityIsTemplate) {
                const firstRow = $('<tr></tr>');

                let columnSortOption: ColumnSortOption | undefined = undefined;
                if (this._sortOption === TABLE_SORT_OPTION.MANUAL) {
                    columnSortOption = game.user.getFlag(
                        game.system.id,
                        entity.uuid + '.' + this.templateAddress + '.sortOption'
                    ) as ColumnSortOption;
                }

                if (!this._headDisplay) {
                    firstRow.addClass('custom-system-hidden-row');
                }

                const cell = $('<td></td>');
                cell.addClass('custom-system-cell');

                if (this._head) {
                    cell.addClass('custom-system-cell-boldTitle');
                }

                switch (this._nameAlign) {
                    case 'center':
                        cell.addClass('custom-system-cell-alignCenter');
                        break;
                    case 'right':
                        cell.addClass('custom-system-cell-alignRight');
                        break;
                    case 'left':
                    default:
                        cell.addClass('custom-system-cell-alignLeft');
                        break;
                }

                const colNameDiv = $('<div></div>');
                colNameDiv.addClass('custom-system-field custom-system-field-full-size');

                const colNameSpan = $('<span></span>');
                colNameSpan.append(this._nameLabel);

                colNameDiv.append(colNameSpan);

                if (TemplateSystem.isAppliedTemplateSystem(entity) && this._sortOption === TABLE_SORT_OPTION.MANUAL) {
                    colNameDiv.append('&nbsp;');
                    let nextSortIsToAsc = true;

                    if (columnSortOption?.prop === 'name') {
                        nextSortIsToAsc = columnSortOption.operator !== COMPARISON_OPERATOR.LESSER_THAN;
                        colNameDiv.append(
                            `<i class="fas fa-caret-${
                                columnSortOption.operator === COMPARISON_OPERATOR.GREATER_THAN ? 'up' : 'down'
                            }"></i>`
                        );
                    }

                    cell.addClass('custom-system-clickable');
                    cell.on('click', () => {
                        fastSetFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.sortOption', {
                            prop: 'name',
                            operator: nextSortIsToAsc
                                ? COMPARISON_OPERATOR.LESSER_THAN
                                : COMPARISON_OPERATOR.GREATER_THAN
                        });

                        void entity.render(false);
                    });
                }

                cell.append(colNameDiv);
                firstRow.append(cell);

                for (const component of this.contents) {
                    const cell = $('<td></td>');

                    columnsVisibility[component.key!].column = cell[0] as HTMLTableCellElement;

                    cell.addClass('custom-system-cell');

                    switch (this._rowLayout[component.key!].align) {
                        case 'center':
                            cell.addClass('custom-system-cell-alignCenter');
                            break;
                        case 'right':
                            cell.addClass('custom-system-cell-alignRight');
                            break;
                        case 'left':
                        default:
                            cell.addClass('custom-system-cell-alignLeft');
                            break;
                    }

                    if (this._head) {
                        cell.addClass('custom-system-cell-boldTitle');
                    }

                    const colNameDiv = $('<div></div>');
                    colNameDiv.addClass(
                        'custom-system-field custom-system-field-' + ((component as SizedComponent).size ?? 'full-size')
                    );

                    if ((component as SizedComponent).size === 'custom') {
                        colNameDiv.css({ width: (component as SizedComponent).customSize ?? 50 });
                    }

                    if (entityIsTemplate) {
                        const sortLeftTabButton = $('<a><i class="fas fa-caret-left custom-system-clickable"></i></a>');
                        sortLeftTabButton.addClass('item');
                        sortLeftTabButton.attr(
                            'title',
                            game.i18n.localize('CSB.ComponentProperties.ExtensibleTable.ColumnSort.SortLeft')
                        );

                        sortLeftTabButton.on('click', () => {
                            void component.sortBeforeInParent(entity);
                        });

                        colNameDiv.append(sortLeftTabButton);
                    }

                    const colNameSpan = $('<span></span>');

                    const colName =
                        (this._rowLayout[component.key!].colName ?? '') === ''
                            ? '&nbsp;'
                            : this._rowLayout[component.key!].colName!;

                    colNameSpan.append(colName);

                    if (entityIsTemplate) {
                        colNameSpan.addClass('custom-system-editable-component');
                        colNameSpan.append(' {' + component.key + '}');
                        colNameSpan.on('click', () => {
                            component.editComponent(
                                entity,
                                this._rowLayout[component.key!],
                                ItemContainer.ALLOWED_COMPONENTS
                            );
                        });
                    }

                    colNameDiv.append(colNameSpan);

                    if (
                        TemplateSystem.isAppliedTemplateSystem(entity) &&
                        this._sortOption === TABLE_SORT_OPTION.MANUAL
                    ) {
                        colNameDiv.append('&nbsp;');
                        let nextSortIsToAsc = true;

                        if (columnSortOption && columnSortOption?.prop === component.key) {
                            nextSortIsToAsc = columnSortOption.operator !== COMPARISON_OPERATOR.LESSER_THAN;
                            colNameDiv.append(
                                `<i class="fas fa-caret-${
                                    columnSortOption.operator === COMPARISON_OPERATOR.GREATER_THAN ? 'up' : 'down'
                                }"></i>`
                            );
                        }

                        cell.addClass('custom-system-clickable');
                        cell.on('click', () => {
                            fastSetFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.sortOption', {
                                prop: component.key,
                                operator: nextSortIsToAsc
                                    ? COMPARISON_OPERATOR.LESSER_THAN
                                    : COMPARISON_OPERATOR.GREATER_THAN
                            });

                            void entity.render(false);
                        });
                    }

                    if (entityIsTemplate) {
                        const sortRightTabButton = $(
                            '<a><i class="fas fa-caret-right custom-system-clickable"></i></a>'
                        );
                        sortRightTabButton.addClass('item');
                        sortRightTabButton.attr(
                            'title',
                            game.i18n.localize('CSB.ComponentProperties.ExtensibleTable.ColumnSort.SortRight')
                        );

                        sortRightTabButton.on('click', () => {
                            void component.sortAfterInParent(entity);
                        });

                        colNameDiv.append(sortRightTabButton);
                    }

                    cell.append(colNameDiv);
                    firstRow.append(cell);
                }

                if (this._showDelete || entityIsTemplate) {
                    const headControlsCell = $('<td></td>');

                    if (entityIsTemplate) {
                        headControlsCell.addClass('custom-system-cell custom-system-cell-alignRight');
                        headControlsCell.append(
                            await this.renderTemplateControls(entity, {
                                allowedComponents: ItemContainer.ALLOWED_COMPONENTS
                            })
                        );
                    }

                    firstRow.append(headControlsCell);
                }

                tableBody.append(firstRow);
            }

            for (const [index, item] of relevantItems.entries()) {
                const tableRow = $('<tr></tr>');
                tableRow.addClass('custom-system-dynamicRow');

                const tableCell = $('<td></td>');
                tableCell.addClass('custom-system-cell');

                switch (this._nameAlign) {
                    case 'center':
                        tableCell.addClass('custom-system-cell-alignCenter');
                        break;
                    case 'right':
                        tableCell.addClass('custom-system-cell-alignRight');
                        break;
                    case 'left':
                    default:
                        tableCell.addClass('custom-system-cell-alignLeft');
                        break;
                }

                tableCell.append(this._generateItemLink(item));

                tableRow.append(tableCell);

                for (const component of this.contents) {
                    const cell = $('<td></td>');
                    cell.addClass('custom-system-cell');

                    switch (this._rowLayout[component.key!].align) {
                        case 'center':
                            cell.addClass('custom-system-cell-alignCenter');
                            break;
                        case 'right':
                            cell.addClass('custom-system-cell-alignRight');
                            break;
                        case 'left':
                        default:
                            cell.addClass('custom-system-cell-alignLeft');
                            break;
                    }

                    const newCompJson = component.toJSON();
                    newCompJson.key = `${this._key}.${item.id}.${component.key}`;

                    const itemProps = item.getRollData();

                    const newComponent = componentFactory.createOneComponent(newCompJson);

                    cell.append(
                        await newComponent.render(entity, isEditable, {
                            ...options,
                            customProps: { ...options.customProps, item: itemProps },
                            linkedEntity: item,
                            reference: `${this.key}.${item.id}`
                        })
                    );

                    const visible = newComponent.canBeRendered(entity, {
                        ...options,
                        customProps: { ...options.customProps, item: itemProps },
                        linkedEntity: item,
                        reference: `${this.key}.${item.id}`
                    });

                    if (!visible) {
                        cell.addClass('custom-system-cell-hidden');
                    }

                    columnsVisibility[component.key!].visible = columnsVisibility[component.key!].visible || visible;

                    tableRow.append(cell);
                }

                if (this._showDelete || this._sortOption === TABLE_SORT_OPTION.MANUAL) {
                    const controlCell = $('<td></td>');
                    const controlDiv = $('<div></div>');
                    controlDiv.addClass('custom-system-dynamic-table-row-icons');

                    if (isEditable && TemplateSystem.isAppliedTemplateSystem(entity)) {
                        if (this._sortOption === TABLE_SORT_OPTION.MANUAL) {
                            const sortSpan = $('<span></span>');
                            sortSpan.addClass('custom-system-dynamic-table-sort-icon-wrapper');

                            if (item !== relevantItems[0]) {
                                const sortUpLink = $(
                                    '<a class="custom-system-sortUpDynamicLine custom-system-clickable"><i class="fas fa-sort-up custom-system-dynamic-table-sort-icon"></i></a>'
                                );
                                sortSpan.append(sortUpLink);

                                sortUpLink.on('click', () => {
                                    this._swapItemElements(entity, index - 1, index);
                                });
                            }

                            if (item !== relevantItems[relevantItems.length - 1]) {
                                const sortDownLink = $(
                                    '<a class="custom-system-sortDownDynamicLine custom-system-clickable"><i class="fas fa-sort-down custom-system-dynamic-table-sort-icon"></i></a>'
                                );
                                sortSpan.append(sortDownLink);

                                sortDownLink.on('click', () => {
                                    this._swapItemElements(entity, index + 1, index);
                                });
                            }

                            controlDiv.append(sortSpan);
                        }

                        if (this._showDelete) {
                            const deleteLink = $(
                                '<a><i class="fas fa-trash custom-system-deleteDynamicLine custom-system-clickable"></i></a>'
                            );

                            const deleteItem = async () => {
                                if (!item.id) {
                                    return;
                                }

                                await item.delete();
                                entity.render(false);
                            };

                            if (this._deleteWarning) {
                                deleteLink.on('click', () => {
                                    void foundry.applications.api.DialogV2.confirm({
                                        window: {
                                            title: game.i18n.localize(
                                                'CSB.ComponentProperties.ItemContainer.DeleteItemDialog.Title'
                                            ),
                                            icon: 'fas fa-trash'
                                        },
                                        content: `<p>${game.i18n.localize(
                                            'CSB.ComponentProperties.ItemContainer.DeleteItemDialog.Content'
                                        )}</p>`,
                                        defaultYes: false,
                                        modal: true,
                                        rejectClose: true
                                    }).then((shouldDelete) => {
                                        if (shouldDelete) {
                                            void deleteItem();
                                        }
                                    });
                                });
                            } else {
                                deleteLink.on('click', () => {
                                    void deleteItem();
                                });
                            }

                            controlDiv.append(deleteLink);
                        }
                    }

                    controlCell.append(controlDiv);
                    tableRow.append(controlCell);
                }

                tableBody.append(tableRow);
            }

            if (isEditable && this.canPlayerAdd) {
                const addRow = $('<tr></tr>');
                const fillCell = $('<td></td>');
                fillCell.attr('colspan', this.contents.length + 1);

                const addButtonCell = $('<td></td>');
                const addButton = $(
                    '<a class="custom-system-addDynamicLine custom-system-clickable"><i class="fas fa-plus-circle"></i></a>'
                );

                addButton.on('click', () => {
                    void (async () => {
                        if (!this._defaultTemplate) {
                            ui.notifications.error(
                                game.i18n.localize('CSB.ComponentProperties.ItemContainer.DefaultTemplateNotSet')
                            );
                            Logger.error(
                                game.i18n.localize('CSB.ComponentProperties.ItemContainer.DefaultTemplateNotSet')
                            );
                            return;
                        }

                        const allItemTemplates = getGameCollectionAsTemplateSystems('item')
                            .filter(
                                (entity) =>
                                    entity.isAssignableTemplate &&
                                    (this._templateFilter.length === 0 ||
                                        this._templateFilter.includes(entity.entity.id!))
                            )
                            .map((entity) => {
                                return {
                                    id: entity.entity.id!,
                                    name: entity.entity.name
                                };
                            });

                        const tpl = await foundry.applications.handlebars.renderTemplate(
                            `systems/${game.system.id}/templates/_template/dialogs/newItemInDisplayer.hbs`,
                            {
                                defaultItemName:
                                    this._newItemDefaultName ??
                                    game.i18n.localize(
                                        'CSB.ComponentProperties.ItemContainer.AddItemDialog.DefaultName'
                                    ),
                                ITEMTEMPLATES: Object.fromEntries(
                                    allItemTemplates.map((tpl) => {
                                        return [tpl.id, tpl.name];
                                    })
                                ),
                                defaultTemplate: this._defaultTemplate,
                                displayTemplates: this._createItemDialogShowTemplateList
                            }
                        );

                        void foundry.applications.api.DialogV2.prompt({
                            window: {
                                title:
                                    this._createItemDialogTitle ??
                                    game.i18n.localize(
                                        'CSB.ComponentProperties.ItemContainer.AddItemDialog.DefaultTitle'
                                    ),
                                icon: 'fas fa-circle-plus'
                            },
                            content: tpl,
                            ok: {
                                label:
                                    this._createItemDialogButton ??
                                    game.i18n.localize(
                                        'CSB.ComponentProperties.ItemContainer.AddItemDialog.DefaultButton'
                                    ),
                                callback: (
                                    _event: PointerEvent | SubmitEvent,
                                    button: HTMLButtonElement,
                                    _dialog: unknown
                                ) => {
                                    return {
                                        itemName: (button.form?.elements.namedItem('itemName') as HTMLInputElement)
                                            ?.value,
                                        itemTpl: (button.form?.elements.namedItem('itemTemplate') as HTMLSelectElement)
                                            ?.value
                                    };
                                }
                            }
                        })
                            .then((newItemData: { itemName?: string | null; itemTpl?: string | null } | null) => {
                                if (!newItemData) {
                                    return;
                                }

                                if (newItemData.itemName && newItemData.itemName !== '') {
                                    void entity.addItems(
                                        [
                                            {
                                                type: 'equippableItem',
                                                name: newItemData.itemName,
                                                system: { template: newItemData.itemTpl ?? this._defaultTemplate }
                                            }
                                        ],
                                        true
                                    );
                                }
                            })
                            .catch(() => {});
                    })();
                });

                addButtonCell.append(addButton);

                addRow.append(fillCell);
                addRow.append(addButtonCell);
                tableBody.append(addRow);
            }

            if (relevantItems.length == 0 && this._labelWhenEmpty) {
                const labelRow = $('<tr/>');
                const rowContents = $('<td/>');

                rowContents.addClass('custom-system-item-container-label-when-empty');

                const additionalColumns = 1 + (this._showDelete ? 1 : 0); // Item link is always there, delete button may not be there

                rowContents.attr('colspan', this._contents.length + additionalColumns);
                rowContents.text(this._labelWhenEmpty);

                labelRow.append(rowContents);
                tableBody.append(labelRow);
            }

            Object.entries(columnsVisibility).forEach(([key, { column, visible }]) => {
                if (column) {
                    if (!visible && relevantItems.length == 0) {
                        const dummyComponent = this.contents.find((comp) => comp.key === key)!;

                        visible = dummyComponent.canBeRendered(entity, {
                            ...options
                        });
                    }

                    if (!visible) {
                        column.textContent = '';
                        column.classList.add('custom-system-cell-hidden');
                    }
                }
            });

            tableElement.append(tableBody);
            jQElement.append(tableElement);
        }

        return jQElement;
    }

    private _getRowEntries(
        entity: TemplateSystem,
        computationKey: string,
        options?: ComponentRenderOptions
    ): { reference: string; data: CustomItem<'equippableItem'> }[] {
        return this.filterItems(entity, options).map((item) => ({
            reference: `${computationKey}.${item.id!}`,
            data: item
        }));
    }

    public getComputeFunctions(
        entity: AppliedTemplateSystem,
        options?: ComponentRenderOptions,
        keyOverride?: string
    ): Array<ComputeFunction | ComputeParameters> {
        const computationKey = keyOverride ?? this.key;
        const computableFields: Array<Component & ComputableElement> = this.contents.filter((component) =>
            isComputableElement(component)
        );

        let computationFunctions: Array<ComputeFunction | ComputeParameters> = [];

        this._getRowEntries(entity, computationKey, options).forEach((entry) => {
            [...ItemContainer.getPredefinedHiddenColumns(), ...this._hiddenColumns].forEach((hiddenColumn) => {
                computationFunctions.push({
                    key: `${entry.reference}.${hiddenColumn.key}`,
                    formula: hiddenColumn.formula,
                    context: entity,
                    options: {
                        ...options,
                        reference: entry.reference,
                        customProps: {
                            ...options?.customProps,
                            get item() {
                                return (entry.data as CustomItem).getRollData();
                            }
                        },
                        linkedEntity: entry.data
                    }
                });
            });

            computableFields.forEach((field) => {
                const newFormulas = this._getComputeFunctionsOfField(entity, entry, field, options);

                computationFunctions = [...computationFunctions, ...newFormulas];
            });
        });

        return computationFunctions;
    }

    private _getComputeFunctionsOfField(
        entity: TemplateSystem,
        entry: { reference: string; data?: unknown },
        field: Component & ComputableElement,
        options?: ComponentRenderOptions
    ): Array<ComputeFunction | ComputeParameters> {
        const customProps = {
            ...options?.customProps,
            get item() {
                return (entry.data as CustomItem).getRollData();
            }
        };

        return field.getComputeFunctions(
            entity,
            {
                ...options,
                reference: `${entry.reference}`,
                customProps,
                linkedEntity: entry.data as CustomItem
            },
            `${entry.reference}.${field.key}`
        );
    }

    resetComputeValue(valueKeys: Array<string>, entity: AppliedTemplateSystem) {
        const resetValues: Record<string, Primitive> = {};

        for (const key of valueKeys) {
            foundry.utils.setProperty(resetValues, key, null);
        }

        const existingRows = <{ [k: string]: unknown }>foundry.utils.getProperty(entity.getRollData(), this.key);

        for (const existingKey in existingRows) {
            const buildKey = `${this.key}.${existingKey}`;
            if (!valueKeys.some((key) => key.startsWith(buildKey))) {
                foundry.utils.setProperty(resetValues, buildKey, null);
            }
        }

        return resetValues;
    }

    getSendToChatFunctions(entity: AppliedTemplateSystem, options: ComponentRenderOptions = {}): ChatSenderMap {
        if (!this.key) {
            return {};
        }

        const relevantFields: Array<ChatSenderElement> = this.contents.filter((component) =>
            isChatSenderElement(component)
        );

        const relevantItems = this.filterItems(entity, options);

        const res: ChatSenderMap = {};

        for (const item of relevantItems) {
            res[item.id!] = {};

            for (const chatSenderElement of relevantFields) {
                foundry.utils.mergeObject(
                    res[item.id!],
                    chatSenderElement.getSendToChatFunctions(entity, {
                        ...options,
                        reference: `${this.key}.${item.id!}`,
                        linkedEntity: item
                    })
                );
            }
        }

        return {
            [this.key]: res
        };
    }

    public recalculateAddresses(newAddress: string) {
        this._templateAddress = newAddress;

        this.contents.forEach((component, index) => {
            component.recalculateAddresses(this.templateAddress + '-rowLayout-' + index);
        });
    }

    /**
     * Returns serialized component
     * @override
     */
    toJSON(): ItemContainerJson {
        const jsonObj = super.toJSON();

        return {
            ...jsonObj,
            title: this._title,
            hideEmpty: this._hideEmpty,
            hiddenColumns: this._hiddenColumns,
            sortOption: this._sortOption,
            headDisplay: this._headDisplay,
            showCreate: this._showCreate,
            defaultTemplate: this._defaultTemplate,
            createItemDialogTitle: this._createItemDialogTitle,
            createItemDialogShowTemplateList: this._createItemDialogShowTemplateList,
            createItemDialogButton: this._createItemDialogButton,
            newItemDefaultName: this._newItemDefaultName,
            showDelete: this._showDelete,
            statusIcon: this._statusIcon,
            nameAlign: this._nameAlign,
            nameLabel: this._nameLabel,
            templateFilter: this._templateFilter,
            itemFilterFormula: this._itemFilterFormula,
            sortPredicates: this._sortPredicates
        };
    }

    /**
     * Creates Item Container from JSON description
     * @override
     */
    static fromJSON(json: ItemContainerJson, templateAddress: string, parent?: Container): ItemContainer {
        const rowContents: Array<Component> = [];
        const rowLayout: Record<string, ExtensibleColumnProps> = {};

        const itemContainer = new ItemContainer({
            ...json,
            contents: rowContents,
            rowLayout: rowLayout,

            parent: parent,
            templateAddress: templateAddress
        });

        for (const [index, componentDesc] of (json.rowLayout ?? []).entries()) {
            const component = componentFactory.createOneComponent(
                componentDesc,
                templateAddress + '-rowLayout-' + index,
                itemContainer
            );
            rowContents.push(component);
            rowLayout[component.key!] = {
                align: componentDesc.align,
                colName: componentDesc.colName
            };
        }

        return itemContainer;
    }

    /**
     * Gets technical name for this component's type
     * @return The technical name
     * @throws {Error} If not implemented
     */
    static getTechnicalName(): string {
        return 'itemContainer';
    }

    /**
     * Gets pretty name for this component's type
     * @return The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName(): string {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.ItemContainer');
    }

    /**
     * Get configuration form for component creation / edition
     * @return The element holding the configuration form
     */
    static async getConfigForm(
        _entity: TemplateSystem,
        appId: string,
        existingComponent?: ItemContainerJson & JSONObject
    ): Promise<HTMLElement> {
        const predefinedValuesComponent = { ...existingComponent };

        predefinedValuesComponent.headDisplay ??= true;
        predefinedValuesComponent.showDelete ??= true;
        predefinedValuesComponent.nameLabel ??= game.i18n.localize(
            'CSB.ComponentProperties.ItemContainer.ItemRefColLabelDefault'
        );
        predefinedValuesComponent.sortOption ??= TABLE_SORT_OPTION.MANUAL;
        predefinedValuesComponent.itemFilterFormula ??= '';
        predefinedValuesComponent.hiddenColumns = [
            ...ItemContainer.getPredefinedHiddenColumns(),
            ...(predefinedValuesComponent.hiddenColumns ?? [])
        ];

        const allItemTemplates = getGameCollectionAsTemplateSystems('item')
            .filter((entity) => entity.isAssignableTemplate)
            .map((entity) => {
                return {
                    id: entity.entity.id!,
                    name: entity.entity.name
                };
            });

        const mainElt = document.createElement('div');

        mainElt.innerHTML = await foundry.applications.handlebars.renderTemplate(
            'systems/' + game.system.id + '/templates/_template/components/itemContainer.hbs',
            {
                ...predefinedValuesComponent,
                availableTemplates: allItemTemplates.map((tpl) => ({
                    id: tpl.id,
                    name: tpl.name,
                    checked: existingComponent?.templateFilter?.includes(tpl.id) ?? false
                })),
                ALIGNMENTS: getLocalizedAlignmentList(),
                SORT_OPERATORS,
                ITEMTEMPLATES: Object.fromEntries(
                    allItemTemplates.map((tpl) => {
                        return [tpl.id, tpl.name];
                    })
                ),
                appId
            }
        );

        mainElt.querySelectorAll("input[name='containerSortOption']").forEach((elt) => {
            elt.addEventListener('change', (event) => {
                const targetValue = (event.currentTarget as HTMLInputElement).value;
                const autoSort = $(mainElt.querySelector('.custom-system-sort-auto')!);
                const manualSort = $(mainElt.querySelector('.custom-system-sort-manual')!);
                const disabledSort = $(mainElt.querySelector('.custom-system-sort-disabled')!);
                const slideValue = 200;

                autoSort.slideUp(slideValue);
                manualSort.slideUp(slideValue);
                disabledSort.slideUp(slideValue);

                switch (targetValue) {
                    case 'auto':
                        autoSort.slideDown(slideValue);
                        break;
                    case 'manual':
                        manualSort.slideDown(slideValue);
                        break;
                    case 'disabled':
                        disabledSort.slideDown(slideValue);
                        break;
                }
            });
        });

        mainElt.querySelector('.custom-system-add-sort-predicate')?.addEventListener('click', () => {
            const newId = String(
                parseInt(
                    Array.from(mainElt.querySelectorAll<HTMLElement>('.custom-system-sort-predicate')).pop()?.dataset
                        .index ?? '-1'
                ) + 1
            );

            const newRow = mainElt
                .querySelector<HTMLTemplateElement>('.custom-system-sort-predicate-template')
                ?.content.cloneNode(true) as HTMLElement;

            newRow.querySelector<HTMLElement>('.custom-system-sort-predicate')!.dataset.index = newId;
            newRow.querySelector<HTMLInputElement>('.custom-system-sort-predicate-property')!.name =
                `sortProp.${newId}`;
            newRow.querySelector<HTMLInputElement>('.custom-system-sort-predicate-operation')!.name = `sortOp.${newId}`;
            newRow.querySelector<HTMLInputElement>('.custom-system-sort-predicate-value')!.name = `sortValue.${newId}`;

            mainElt.querySelector('.custom-system-sort-predicates > tbody')?.append(newRow);
        });

        mainElt.querySelector('.custom-system-sort-predicates')?.addEventListener('click', (ev) => {
            const target = (ev.target as HTMLElement).closest('.custom-system-delete-sort-predicate');

            if (target) {
                target.closest('tr')?.remove();
            }
        });

        mainElt.querySelector('.custom-system-add-hidden-column')?.addEventListener('click', () => {
            const newId = String(
                parseInt(
                    Array.from(mainElt.querySelectorAll<HTMLElement>('.custom-system-table-hidden-column')).pop()
                        ?.dataset.index ?? '-1'
                ) + 1
            );

            const newRow = (
                mainElt.querySelector('.custom-system-table-hidden-column-template') as HTMLTemplateElement
            ).content.cloneNode(true) as HTMLElement;

            newRow.querySelector<HTMLElement>('.custom-system-table-hidden-column')!.dataset.index = newId;
            newRow.querySelector<HTMLInputElement>('.custom-system-table-hidden-column-key')!.name =
                `hiddenColumnKey.${newId}`;
            newRow.querySelector<HTMLInputElement>('.custom-system-table-hidden-column-formula')!.name =
                `hiddenColumnFormula.${newId}`;
            newRow.querySelector<HTMLInputElement>('.custom-system-table-hidden-column-is-predefined')!.name =
                `hiddenColumnIsPredefined.${newId}`;

            mainElt.querySelector<HTMLElement>('.custom-system-table-hidden-columns > tbody')?.append(newRow);
        });

        mainElt.querySelector('.custom-system-table-hidden-columns')?.addEventListener('click', (ev) => {
            const target = (ev.target as HTMLElement).closest('.custom-system-delete-hidden-column');

            if (target) {
                target.closest('tr')?.remove();
            }
        });

        function resetDefaultTemplateOptions() {
            const selectedDefaultTemplate = mainElt.querySelector<HTMLSelectElement>("[name='defaultTemplate']")?.value;
            const selectedIds = Array.from(mainElt.querySelectorAll("[name='itemFilterTemplate']").values())
                .filter((e) => e instanceof HTMLInputElement && e.checked)
                .map((e) => (e as HTMLInputElement).value);

            const eligibleTemplates =
                selectedIds.length > 0
                    ? allItemTemplates.filter((tpl) => selectedIds.includes(tpl.id))
                    : allItemTemplates;

            const options = eligibleTemplates.map((tpl) => `<option value=${tpl.id}>${tpl.name}</option>`);

            mainElt.querySelector<HTMLSelectElement>("[name='defaultTemplate']")!.innerHTML = options.join('');
            mainElt.querySelector<HTMLSelectElement>("[name='defaultTemplate']")!.value =
                selectedDefaultTemplate && eligibleTemplates.find((elt) => elt.id === selectedDefaultTemplate)
                    ? selectedDefaultTemplate
                    : (eligibleTemplates[0]?.id ?? '');
        }

        mainElt.querySelector('.itemFilterTemplate-fieldset')?.addEventListener('click', (event) => {
            if (event.target instanceof HTMLInputElement && event.target.name === 'itemFilterTemplate') {
                resetDefaultTemplateOptions();
            }
        });

        resetDefaultTemplateOptions();

        mainElt.querySelector(`input[name="showCreate"]`)?.addEventListener('click', (event) => {
            const target = event.currentTarget as HTMLInputElement;
            const createItemFields = $(mainElt.querySelectorAll('.custom-system-item-creation-field'));
            const slideValue = 200;

            if (target.checked) {
                createItemFields.slideDown(slideValue);
            } else {
                createItemFields.slideUp(slideValue);
            }
        });

        return mainElt;
    }

    /**
     * Extracts configuration from submitted HTML form
     * @override
     * @param rawConfigData
     * @param html The submitted form
     * @return The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(rawConfigData: ComponentConfigFormData, html: HTMLFormElement): ItemContainerJson {
        const configData = <
            {
                title?: string;
                labelWhenEmpty?: string;
                nameLabel?: string;
                nameAlign?: Alignment;

                hiddenColumnKey?: Record<string, string>;
                hiddenColumnFormula?: Record<string, string>;
                hiddenColumnIsPredefined?: Record<string, boolean>;

                itemFilterFormula?: string;
                itemFilterTemplate?: string[];

                containerSortOption?: TABLE_SORT_OPTION;

                sortProp?: Record<string, string>;
                sortOp?: Record<string, string>;
                sortValue?: Record<string, string>;

                hideEmpty?: boolean;
                headDisplay?: boolean;
                head?: boolean;

                showCreate?: boolean;
                defaultTemplate?: string;
                createItemDialogTitle?: string;
                createItemDialogShowTemplateList?: boolean;
                createItemDialogButton?: string;
                newItemDefaultName?: string;

                showDelete?: boolean;
                deleteWarning?: boolean;
                statusIcon?: boolean;
            }
        >rawConfigData;

        if (typeof configData.itemFilterTemplate === 'string') {
            configData.itemFilterTemplate = [configData.itemFilterTemplate];
        }

        const fieldData = super.extractConfig(configData, html) as ItemContainerJson;

        fieldData.title = configData.title;
        fieldData.hideEmpty = configData.hideEmpty;
        fieldData.labelWhenEmpty = configData.labelWhenEmpty;
        fieldData.headDisplay = configData.headDisplay;
        fieldData.head = configData.head;
        fieldData.showCreate = configData.showCreate;
        fieldData.defaultTemplate = configData.defaultTemplate;
        fieldData.createItemDialogTitle =
            configData.createItemDialogTitle !== '' ? configData.createItemDialogTitle : undefined;
        fieldData.createItemDialogShowTemplateList = configData.createItemDialogShowTemplateList;
        fieldData.createItemDialogButton =
            configData.createItemDialogButton !== '' ? configData.createItemDialogButton : undefined;
        fieldData.newItemDefaultName = configData.newItemDefaultName !== '' ? configData.newItemDefaultName : undefined;
        fieldData.showDelete = configData.showDelete;
        fieldData.deleteWarning = configData.deleteWarning;
        fieldData.statusIcon = configData.statusIcon;
        fieldData.nameAlign = configData.nameAlign ?? 'left';
        fieldData.nameLabel = configData.nameLabel;
        fieldData.sortOption = configData.containerSortOption;
        fieldData.itemFilterFormula = configData.itemFilterFormula;
        fieldData.templateFilter = (configData.itemFilterTemplate ?? []).filter(
            (group: string | null) => group !== null
        );

        fieldData.hiddenColumns = Object.entries(configData.hiddenColumnKey ?? {}).map(([idx, key]) => ({
            key,
            formula: (configData.hiddenColumnFormula ?? {})[idx],
            isPredefined: (configData.hiddenColumnIsPredefined ?? {})[idx]
        }));

        if (fieldData.sortOption === TABLE_SORT_OPTION.AUTO) {
            fieldData.sortPredicates = Object.entries(configData.sortProp ?? {}).map(([idx, prop]) => ({
                prop,
                operator: (configData.sortOp ?? {})[idx] as SortOperator,
                value: (configData.sortValue ?? {})[idx]
            }));
        } else {
            fieldData.sortPredicates = [];
        }

        return fieldData;
    }

    /**
     * Filters items by template and itemFilters
     */
    private filterItems(entity: TemplateSystem, options: FormulaOptions): Array<CustomItem<'equippableItem'>> {
        return entity.items.filter((item) => {
            if (!CustomItem.isEquippableItem(item)) {
                return false;
            }

            if (
                !item.system.template ||
                (this._templateFilter.length > 0 && !this._templateFilter.includes(item.system.template))
            ) {
                return false;
            }

            if (!this._itemFilterFormula) {
                return true;
            }

            try {
                return !!castToPrimitive(
                    new Formula(this._itemFilterFormula).computeStatic(
                        {
                            ...entity.getRollData(),
                            item: item.getRollData()
                        },
                        {
                            ...options,
                            source: `${this.key}.${item.name}.filter`
                        }
                    ).result
                );
            } catch (err) {
                if (err instanceof Error) {
                    Logger.error(err.message, err);
                    ui.notifications.error(err);
                } else if (typeof err === 'string') {
                    Logger.error(err);
                    ui.notifications.error(err);
                }

                return false;
            }
            //oxlint-disable-next-line typescript/no-unnecessary-type-assertion
        }) as Array<CustomItem<'equippableItem'>>;
    }

    /**
     * Sorts an array of items based on sort predicates
     */
    protected _sortItems(
        items: Array<CustomItem<'equippableItem'>>,
        entity: AppliedTemplateSystem
    ): Array<CustomItem<'equippableItem'>> {
        let sortPredicates: Array<SortPredicate>;

        let columnSortOption: ColumnSortOption | undefined = undefined;

        // Get all properties
        const itemContainerProps = <Record<string, Record<string, Primitive>>>(
            foundry.utils.getProperty(entity.getRollData(), this.key)
        );

        switch (this._sortOption) {
            case TABLE_SORT_OPTION.AUTO:
                sortPredicates = this._sortPredicates.map((predicate) => ({ ...predicate })).reverse();
                sortPredicates.forEach((predicate) => {
                    items.sort((a, b) => {
                        const targetValue = castToPrimitive(predicate.value);
                        let aValue, bValue;

                        // If predicate property exists in the columns, we sort on column value
                        if (this.contents.find((component) => component.key === predicate.prop)) {
                            aValue = castToPrimitive(itemContainerProps[a.id!][predicate.prop]);
                            bValue = castToPrimitive(itemContainerProps[b.id!][predicate.prop]);
                        } else {
                            // Else we sort on item property value
                            aValue = castToPrimitive(a.getRollData()[predicate.prop] as Primitive);
                            bValue = castToPrimitive(b.getRollData()[predicate.prop] as Primitive);
                        }

                        return ItemContainer.getSortOrder(aValue ?? '', bValue ?? '', targetValue, predicate.operator);
                    });
                });

                break;
            case TABLE_SORT_OPTION.MANUAL:
                columnSortOption = game.user.getFlag(
                    game.system.id,
                    entity.uuid + '.' + this.templateAddress + '.sortOption'
                ) as ColumnSortOption;

                if (columnSortOption?.prop) {
                    if (itemContainerProps) {
                        items.sort((a, b) => {
                            const aValue = castToPrimitive(itemContainerProps[a.id!][columnSortOption!.prop!]) ?? '';
                            const bValue = castToPrimitive(itemContainerProps[b.id!][columnSortOption!.prop!]) ?? '';

                            return ItemContainer.getSortOrder(aValue, bValue, undefined, columnSortOption!.operator!);
                        });
                    }
                } else {
                    const itemOrder = this._synchronizeItemIdsWithItemOrder(
                        items.map((item) => item.id!),
                        (columnSortOption?.savedOrder as Array<string>) ?? []
                    );

                    items.sort((a, b) => {
                        const indexA = itemOrder.indexOf(a.id!);
                        const indexB = itemOrder.indexOf(b.id!);

                        return indexA === -1 ? 1 : indexB === -1 ? -1 : indexA - indexB;
                    });
                }
                break;
            case TABLE_SORT_OPTION.DISABLED:
            default:
                break;
        }

        return items;
    }

    /**
     * Synchronizes item-ids with itemOrder (adds and removes entries from itemOrder)
     * @param itemIds Existing ids
     * @param itemOrder Existing order to filter
     * @return The updated order
     */
    protected _synchronizeItemIdsWithItemOrder(itemIds: Array<string>, itemOrder: Array<string>): Array<string> {
        //Remove item-ids, which are not present anymore
        itemOrder = itemOrder.filter((id) => itemIds.includes(id));
        //Add new item-ids to itemOrder
        itemIds.forEach((id) => {
            if (!itemOrder.includes(id)) {
                itemOrder.push(id);
            }
        });

        return itemOrder;
    }

    /**
     * Generates the element to display the item link in the Container
     * @param item The item to render
     */
    protected _generateItemLink(item: CustomItem): JQuery {
        const itemBox = $('<span></span>');
        const itemLink = $('<a></a>')
            .addClass('content-link')
            .attr({
                'data-type': 'Item',
                'data-entity': 'Item',
                'data-id': item.id,
                'data-uuid': item.uuid,
                'data-tooltip': item.name ?? 'Item',
                'data-link': '',
                'data-scope': '',
                draggable: 'true'
            });

        const itemImg = $('<img></img>')
            .attr({
                src: item.img,
                alt: `${item.name ?? 'Item'} image`,
                draggable: 'false'
            })
            .addClass('custom-system-item-container-image');

        itemLink.append(itemImg);
        itemLink.append(item.name ?? '');

        itemLink.on('click', () => {
            // oxlint-disable-next-line @typescript-eslint/no-deprecated
            void item.sheet?.render(true);
        });

        if (game.user.isGM && this._statusIcon) {
            const templateLink = $('<i class="fa-solid"></i>').css({ 'margin-right': '4px' });
            const templateItem = game.items?.get(item.system.template ?? '');
            if (!templateItem) {
                templateLink.addClass('fa-exclamation-triangle').css({ color: 'rgba(214, 150, 0, 0.8)' });
            } else {
                templateLink.addClass('fa-circle-check');
                templateLink.css({ color: 'rgba(26, 107, 34, 0.8)', cursor: 'pointer' });
                templateLink.on('click', () => {
                    // oxlint-disable-next-line @typescript-eslint/no-deprecated
                    void templateItem.sheet?.render(true);
                });
            }

            itemBox.append(templateLink);
        }

        itemBox.append(itemLink);
        return itemBox;
    }

    /**
     * Swaps two item elements
     * @param entity Rendered entity (actor or item)
     * @param index1
     * @param index2
     * @override
     */
    protected _swapItemElements(entity: TemplateSystem, index1: number, index2: number) {
        const savedOrder = game.user.getFlag(
            game.system.id,
            entity.uuid + '.' + this.templateAddress + '.sortOption.savedOrder'
        ) as Array<string>;

        const temp = savedOrder[index1];
        savedOrder[index1] = savedOrder[index2];
        savedOrder[index2] = temp;

        fastSetFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.sortOption', {
            ['-=prop']: null,
            ['-=operator']: null,
            savedOrder
        });

        entity.render(false);
    }

    /**
     * Add a new Component as eligible for this Container
     *
     * @param name The technical name which identifies the component in the ComponentFactory
     */
    public static addAllowedComponent(name: string) {
        this.ALLOWED_COMPONENTS.push(name);
    }
}

/**
 * @ignore
 */
export default ItemContainer;
