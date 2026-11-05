/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MathJsInstance } from 'mathjs';

import { DefinedPrimitive, JSONObject, JSONValue, Primitive } from '../definitions.js';
import CustomActor from '../documents/CustomActor.js';
import CustomItem from '../documents/CustomItem.js';
import { CharacterActorDataModel } from '../documents/model/actorModel.js';
import TemplateSystem from '../documents/TemplateSystem.js';
import { UncomputableError } from '../errors/UncomputableError.js';
import Logger from '../Logger.js';
import { ExtensibleTableSystemProps } from '../sheets/components/ExtensibleTable.js';
import { castToPrimitive, quoteString } from '../utils.js';
import { DefferedUpdate } from './ComputablePhrase.js';
import Formula from './Formula.js';

type FormulaFunctionOptions = {
    reference?: string;
    defaultValue?: Primitive;
    source: string;
    formula: string;
    computedTokens: { [p: string]: JSONValue };
    triggerEntity?: TemplateSystem;
    linkedEntity?: CustomItem;
    updates: Record<string, DefferedUpdate>;
    availableKeys: string[];
};

type CustomFunctions = {
    sameRow(columnName: string, fallbackValue: Primitive): Primitive;
    sameRowRef(columnName: string): string;
    sameRowIndex(): number;
    lookupRef(
        extensibleTableKey: string,
        targetColumn: string,
        filterColumn: string | null,
        filterValue: Primitive
    ): string[];
    lookup(
        extensibleTableKey: string,
        targetColumn: string,
        filterColumn: string | null,
        filterValue: Primitive,
        comparisonOperator: string
    ): Primitive[];
    alookup(extensibleTableKey: string, targetColumn: string, ...filterArgs: Primitive[]): Primitive[];
    lookupRange(
        extensibleTableKey: string,
        targetColumn: string,
        lookupColumn: string,
        value: number,
        opts: {
            orderBy: 'ASC' | 'DESC';
            isSorted: boolean;
            isInclusive: boolean;
        }
    ): Primitive;
    find(
        extensibleTableKey: string,
        targetColumn: string,
        filterColumn: string,
        filterValue: Primitive,
        comparisonOperator: string
    ): Primitive;
    first(list: Primitive[], fallbackValue: Primitive): Primitive;
    fallback(value: Primitive, fallback: Primitive): Primitive;
    consoleLog<T extends JSONObject>(dataLog: T): T;
    consoleTable<T extends JSONObject>(dataLog: T): T;
    ref(valueRef: string, fallbackValue: Primitive): Primitive;
    replace(text: string, pattern: string, replacement: string): string;
    replaceAll(text: string, pattern: string, replacement: string): string;
    concat(...values: Primitive[]): string;
    recalculate(userInputData: string): Primitive;
    fetchFromParent(formula: string, opt?: { fallback?: Primitive; top?: boolean }): Primitive;
    fetchFromActor(actorName: string, formula: string, fallbackValue: Primitive): Primitive;
    fetchFromUuid(uuid: string, formula: string, fallback: Primitive): Primitive;
    fetchInitiative(entityHandle: string, fallbackValue: Primitive | symbol): Primitive;
    switchCase(expression: Primitive, ...args: Primitive[]): Primitive;
    setInitiative(entityName: string, formula: string, fallbackValue: Primitive | null): Primitive;
    setPropertyInEntity(
        entityName: string,
        propertyName: string | string[],
        formula: string,
        fallbackValue: Primitive | null
    ): Primitive;
    setValues(uuids: string | string[], ...updateArgs: string[]): string;
    notify(messageType: string, message: string): string;
    escapeQuotes(value: string): string;
    array(...values: Primitive[]): Primitive[];
    printEffects(options: {
        uuid?: string;
        active?: boolean;
        tags?: Array<string>;
        format?: 'list' | 'table' | 'list-detailed';
    }): string;
};

export class FormulaFunctionImporter {
    public static importCustomFunctions(
        mathInstance: MathJsInstance,
        props: JSONObject,
        options: FormulaFunctionOptions
    ): CustomFunctions {
        const customFunctions: CustomFunctions = {
            sameRow: function (columnName: string, fallbackValue?: Primitive): Primitive {
                const hasExplicitFallback = arguments.length > 1;
                const fullReference = `${options.reference}.${columnName}`;
                const defaultReturnValue = hasExplicitFallback ? fallbackValue : options.defaultValue;

                // Fetching the value inside dynamic table's row
                const returnValue =
                    castToPrimitive(foundry.utils.getProperty(props, fullReference) as Primitive) ?? defaultReturnValue;

                if (!hasExplicitFallback && returnValue === undefined) {
                    throw new UncomputableError(
                        `Uncomputable token "sameRow(${quoteString(
                            columnName
                        )})". Failed to obtain value from the same row in the column "${columnName}". Make sure, that the column-key is correct.`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                options.computedTokens[`sameRow(${quoteString(columnName)})`] = returnValue;

                return returnValue;
            },
            sameRowRef: (columnName: string): string => {
                return `${options.reference}.${columnName}`;
            },
            sameRowIndex: (): number => {
                if (!options.reference) {
                    throw new UncomputableError(
                        '"sameRowIndex()" can only be used in referencable Tables',
                        options.source,
                        options.formula,
                        props
                    );
                }

                const referenceParts = options.reference.split('.');
                const dynamicTableProps: ExtensibleTableSystemProps = foundry.utils.getProperty(
                    props,
                    referenceParts[0]
                ) as ExtensibleTableSystemProps;
                const rowKeys = Object.entries(dynamicTableProps)
                    .filter(([_, row]) => !row.$deleted)
                    .map(([key, _]) => key);

                return Number(rowKeys.findIndex((row) => row === referenceParts[1]));
            },
            lookupRef: (
                extensibleTableKey: string,
                targetColumn: string,
                filterColumn: string | null = null,
                filterValue: Primitive = null
            ): string[] => {
                const extensibleTableProps: ExtensibleTableSystemProps = foundry.utils.getProperty(
                    props,
                    extensibleTableKey
                ) as ExtensibleTableSystemProps;

                if (extensibleTableProps === undefined) {
                    throw new UncomputableError(
                        `Uncomputable token "lookupRef(${quoteString(extensibleTableKey)}, ${quoteString(
                            targetColumn
                        )}, ${quoteString(filterColumn)}, ${quoteString(filterValue)})"`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                return Object.entries(extensibleTableProps)
                    .filter(([_, row]) => (!row.$deleted && filterColumn ? row[filterColumn] === filterValue : true))
                    .map(([key]) => `${extensibleTableKey}.${key}.${targetColumn}`);
            },
            lookup: (
                extensibleTableKey: string,
                targetColumn: string,
                filterColumn: string | null = null,
                filterValue: Primitive = null,
                comparisonOperator = '==='
            ): Primitive[] => {
                let values: Primitive[] = [];

                let filterFunction: (elt: Record<string, Primitive>) => boolean | RegExpMatchArray | null = () => true;

                if (filterColumn) {
                    filterFunction = (elt) => {
                        switch (comparisonOperator) {
                            case '===':
                                return elt[filterColumn] === filterValue;
                            case '==':
                                return elt[filterColumn] == filterValue;
                            case '>':
                                return Number(elt[filterColumn]) > Number(filterValue);
                            case '>=':
                                return Number(elt[filterColumn]) >= Number(filterValue);
                            case '<':
                                return Number(elt[filterColumn]) < Number(filterValue);
                            case '<=':
                                return Number(elt[filterColumn]) <= Number(filterValue);
                            case '!==':
                                return elt[filterColumn] !== filterValue;
                            case '!=':
                                return elt[filterColumn] != filterValue;
                            case '~':
                                return String(elt[filterColumn]).match(String(filterValue));
                            default:
                                Logger.error(`"${comparisonOperator}" is not a valid comparison operator.`);
                                return false;
                        }
                    };
                }

                const extensibleTableProps: ExtensibleTableSystemProps = foundry.utils.getProperty(
                    props,
                    extensibleTableKey
                ) as ExtensibleTableSystemProps;
                const extensibleTablePropsArray = Object.values(extensibleTableProps ?? {})
                    .filter((row) => !row.$deleted)
                    .map((row) => {
                        const filteredRow: Record<string, Primitive> = {};

                        for (const prop of Object.keys(row).filter((key) => !key.startsWith('$'))) {
                            filteredRow[prop] = row[prop];
                        }

                        return filteredRow;
                    });

                if (
                    extensibleTablePropsArray.length > 0 &&
                    !extensibleTablePropsArray.some(
                        (row) =>
                            Object.keys(row).length > 0 && row[targetColumn] !== undefined && row[targetColumn] !== null
                    )
                ) {
                    throw new UncomputableError(
                        `Uncomputable token "lookup(${quoteString(extensibleTableKey)}, ${quoteString(
                            targetColumn
                        )}, ${quoteString(filterColumn)}, ${quoteString(filterValue)}, ${quoteString(
                            comparisonOperator
                        )})"`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                values = extensibleTablePropsArray
                    .filter((row) => !row.$deleted && filterFunction(row))
                    .map((row) => castToPrimitive(row[targetColumn]))
                    .filter((value) => value !== undefined && value !== null);

                options.computedTokens[
                    `lookup(${quoteString(extensibleTableKey)}, ${quoteString(targetColumn)}, ${quoteString(
                        filterColumn
                    )}, ${quoteString(filterValue)}, ${quoteString(comparisonOperator)})`
                ] = values;

                return values;
            },
            alookup: (extensibleTableKey: string, targetColumn: string, ...filterArgs: Primitive[]): Primitive[] => {
                if (filterArgs.length % 3 != 0) {
                    throw new UncomputableError(
                        `The amount of filter arguments must be a multiple of 3, but you have only ${filterArgs.length}`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                let values: Primitive[] = [];

                const extensibleTableProps: ExtensibleTableSystemProps = foundry.utils.getProperty(
                    props,
                    extensibleTableKey
                ) as ExtensibleTableSystemProps;

                let extensibleTablePropsArray = Object.values(extensibleTableProps ?? {})
                    .filter((row) => !row.$deleted)
                    .map((row) => {
                        const filteredRow: Record<string, Primitive> = {};

                        for (const prop of Object.keys(row).filter((key) => !key.startsWith('$'))) {
                            filteredRow[prop] = row[prop];
                        }

                        return filteredRow;
                    });

                if (
                    extensibleTablePropsArray.length > 0 &&
                    !extensibleTablePropsArray.some(
                        (row) =>
                            Object.keys(row).length > 0 && row[targetColumn] !== undefined && row[targetColumn] !== null
                    )
                ) {
                    throw new UncomputableError(
                        `Uncomputable token "alookup(${quoteString(extensibleTableKey)}, ${quoteString(targetColumn)},
                            ${filterArgs.map((arg) => `'${arg}'`).join(', ')})"`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                for (let i = 0; i < filterArgs.length / 3; i++) {
                    const filterColumn = filterArgs[i * 3] as string;
                    const comparisonOperator = filterArgs[i * 3 + 1] as string;
                    const filterValue = filterArgs[i * 3 + 2];

                    let filterFunction: (elt: Record<string, Primitive>) => boolean | RegExpMatchArray | null = () =>
                        true;

                    if (filterColumn) {
                        filterFunction = (elt) => {
                            switch (comparisonOperator) {
                                case '===':
                                    return elt[filterColumn] === filterValue;
                                case '==':
                                    return elt[filterColumn] == filterValue;
                                case '>':
                                    return Number(elt[filterColumn]) > Number(filterValue);
                                case '>=':
                                    return Number(elt[filterColumn]) >= Number(filterValue);
                                case '<':
                                    return Number(elt[filterColumn]) < Number(filterValue);
                                case '<=':
                                    return Number(elt[filterColumn]) <= Number(filterValue);
                                case '!==':
                                    return elt[filterColumn] !== filterValue;
                                case '!=':
                                    return elt[filterColumn] != filterValue;
                                case '~':
                                    return String(elt[filterColumn]).match(String(filterValue));
                                default:
                                    Logger.error(`"${comparisonOperator}" is not a valid comparison operator.`);
                                    return false;
                            }
                        };
                    }

                    extensibleTablePropsArray = extensibleTablePropsArray.filter((row) => filterFunction(row));
                }

                values = extensibleTablePropsArray
                    .map((row) => castToPrimitive(row[targetColumn]))
                    .filter((value) => value !== undefined && value !== null);

                options.computedTokens[
                    `alookup(${quoteString(extensibleTableKey)}, ${quoteString(targetColumn)},
                            ${filterArgs.map((arg) => `'${arg}'`).join(', ')})`
                ] = values;

                return values;
            },
            lookupRange(
                extensibleTableKey: string,
                targetColumn: string,
                lookupColumn: string,
                value: number,
                opts: {
                    orderBy: 'ASC' | 'DESC';
                    isSorted: boolean;
                    isInclusive: boolean;
                } = {
                    orderBy: 'ASC',
                    isSorted: false,
                    isInclusive: true
                }
            ): Primitive {
                const extensibleTableProps: ExtensibleTableSystemProps = foundry.utils.getProperty(
                    props,
                    extensibleTableKey
                ) as ExtensibleTableSystemProps;

                const extensibleTablePropsArray = Object.values(extensibleTableProps ?? {})
                    .filter((row) => !row.$deleted)
                    .map((row) => {
                        const filteredRow: Record<string, Primitive> = {};

                        for (const prop of Object.keys(row).filter((key) => !key.startsWith('$'))) {
                            filteredRow[prop] = row[prop];
                        }

                        return filteredRow;
                    }) as Record<string, number>[];

                if (
                    extensibleTablePropsArray.length > 0 &&
                    !extensibleTablePropsArray.some(
                        (row) =>
                            Object.keys(row).length > 0 && row[targetColumn] !== undefined && row[targetColumn] !== null
                    )
                ) {
                    throw new UncomputableError(
                        `Uncomputable token "lookupRange(${quoteString(extensibleTableKey)}, ${quoteString(
                            targetColumn
                        )}, ${quoteString(lookupColumn)}, ${quoteString(value)}, 
                            {orderBy: ${quoteString(opts.orderBy)}, isSorted: ${opts.isSorted}, isInclusive: ${
                                opts.isInclusive
                            }})"`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                if (!opts.isSorted) {
                    const compareSort: (a: Record<string, number>, b: Record<string, number>) => number =
                        opts.orderBy === 'ASC'
                            ? (a, b) => a[lookupColumn] - b[lookupColumn]
                            : (a, b) => b[lookupColumn] - a[lookupColumn];

                    extensibleTablePropsArray.sort(compareSort);
                }

                const hasReachedRange: (a: number, b: number) => boolean =
                    opts.orderBy === 'ASC'
                        ? opts.isInclusive
                            ? (a, b) => a <= b
                            : (a, b) => a < b
                        : opts.isInclusive
                          ? (a, b) => a >= b
                          : (a, b) => a > b;

                const returnRow = extensibleTablePropsArray
                    .reverse()
                    .find((row) => hasReachedRange(Number(row[lookupColumn]), Number(value)));

                const returnValue = returnRow ? returnRow[targetColumn] : null;

                options.computedTokens[
                    `lookupRange(${quoteString(extensibleTableKey)}, ${quoteString(targetColumn)},
                            ${quoteString(lookupColumn)}, ${quoteString(value)}, 
                            {orderBy: ${quoteString(opts.orderBy)}, isSorted: ${opts.isSorted}, isInclusive: ${
                                opts.isInclusive
                            }})`
                ] = returnValue;

                return returnValue;
            },
            find: (
                extensibleTableKey: string,
                targetColumn: string,
                filterColumn: string | null = null,
                filterValue: Primitive = null,
                comparisonOperator = '==='
            ): Primitive => {
                let filterFunction: (elt: Record<string, Primitive>) => boolean | RegExpMatchArray | null = () => true;

                if (filterColumn) {
                    filterFunction = (elt) => {
                        switch (comparisonOperator) {
                            case '===':
                                return elt[filterColumn] === filterValue;
                            case '==':
                                return elt[filterColumn] == filterValue;
                            case '>':
                                return Number(elt[filterColumn]) > Number(filterValue);
                            case '>=':
                                return Number(elt[filterColumn]) >= Number(filterValue);
                            case '<':
                                return Number(elt[filterColumn]) < Number(filterValue);
                            case '<=':
                                return Number(elt[filterColumn]) <= Number(filterValue);
                            case '!==':
                                return elt[filterColumn] !== filterValue;
                            case '!=':
                                return elt[filterColumn] != filterValue;
                            case '~':
                                return String(elt[filterColumn]).match(String(filterValue));
                            default:
                                Logger.error(`"${comparisonOperator}" is not a valid comparison operator.`);
                                return false;
                        }
                    };
                }

                const extensibleTableProps: ExtensibleTableSystemProps = foundry.utils.getProperty(
                    props,
                    extensibleTableKey
                ) as ExtensibleTableSystemProps;

                const returnRow = Object.values(extensibleTableProps ?? {}).find((row) => {
                    if (
                        Object.keys(row).length === 0 ||
                        row[targetColumn] === undefined ||
                        row[targetColumn] === null
                    ) {
                        throw new UncomputableError(
                            `Uncomputable token "find(${quoteString(extensibleTableKey)}, ${quoteString(
                                targetColumn
                            )}, ${quoteString(filterColumn)}, ${quoteString(filterValue)}, ${quoteString(
                                comparisonOperator
                            )})"`,
                            options.source,
                            options.formula,
                            props
                        );
                    }

                    return !row.$deleted && filterFunction(row);
                });

                const returnValue = returnRow ? returnRow[targetColumn] : null;

                options.computedTokens[
                    `find(${quoteString(extensibleTableKey)}, ${quoteString(targetColumn)}, ${quoteString(
                        filterColumn
                    )}, ${quoteString(filterValue)}, ${quoteString(comparisonOperator)})`
                ] = returnValue;

                return returnValue;
            },
            first: (list = [], fallbackValue: Primitive | symbol = Symbol('undefined')): Primitive => {
                let returnValue = typeof fallbackValue !== 'symbol' ? fallbackValue : options.defaultValue;

                if (list.length > 0) {
                    returnValue = castToPrimitive(list[0]);
                }

                return returnValue;
            },
            fallback(value: Primitive, fallback: Primitive): Primitive {
                return value ?? fallback;
            },
            consoleLog: <T extends JSONObject>(dataLog: T): T => {
                console.log(dataLog);
                return dataLog;
            },
            consoleTable: <T extends JSONObject>(dataLog: T): T => {
                console.table(dataLog);
                return dataLog;
            },
            ref: function (valueRef: string, fallbackValue?: Primitive): Primitive {
                const hasExplicitFallback = arguments.length > 1;

                let returnValue = hasExplicitFallback ? fallbackValue : options.defaultValue;
                let realValue = undefined;

                if (valueRef) {
                    realValue = foundry.utils.getProperty(props, valueRef) as Primitive;
                    returnValue = castToPrimitive(realValue) ?? returnValue;
                }

                if (
                    (!hasExplicitFallback && returnValue === undefined) ||
                    (realValue === undefined && options.availableKeys.includes(valueRef))
                ) {
                    throw new UncomputableError(
                        `Uncomputable token ref(${quoteString(valueRef)})`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                options.computedTokens[
                    `ref(${quoteString(valueRef)}${hasExplicitFallback ? `, ${quoteString(fallbackValue)}` : ''})`
                ] = returnValue;

                return returnValue;
            },
            replace: (text: string, pattern: string, replacement: string): string => {
                return text.toString().replace(pattern, replacement);
            },
            replaceAll: (text: string, pattern: string, replacement: string): string => {
                return text.toString().replaceAll(pattern, replacement);
            },
            concat: (...values: DefinedPrimitive[]): string => {
                return ''.concat(...values.map(String));
            },
            recalculate: (userInputData: string): Primitive => {
                if (userInputData === undefined) {
                    throw new UncomputableError(
                        'Uncomputable token recalculate()',
                        options.source,
                        options.formula,
                        props
                    );
                }

                try {
                    const value = ComputablePhrase.computeMessageStatic(
                        userInputData.toString(),
                        props,
                        options
                    ).result;

                    return castToPrimitive(value);
                } catch (_err) {
                    throw new UncomputableError(
                        'Uncomputable token recalculate()',
                        options.source,
                        options.formula,
                        props
                    );
                }
            },
            fetchInitiative: (
                entityHandle: string,
                fallbackValue: Primitive | symbol = Symbol('undefined')
            ): Primitive => {
                fallbackValue = typeof fallbackValue !== 'symbol' ? fallbackValue : options.defaultValue;

                let entity: Actor.Stored<'character'> | undefined;
                switch (entityHandle) {
                    case 'self':
                        if (!options.triggerEntity) {
                            throw new UncomputableError(
                                `Missing entity. Make sure, that you provide the triggering Entity in the Options of Formula or ComputablePhrase`,
                                options.source,
                                options.formula,
                                props
                            );
                        }

                        if (!CustomActor.isCharacterActor(options.triggerEntity.entity)) {
                            throw new UncomputableError(
                                `Entity is not an actor. Initiative only exists for Actors`,
                                options.source,
                                options.formula,
                                props
                            );
                        }
                        entity = options.triggerEntity.entity as Actor.Stored<'character'>;
                        break;
                    case 'selected':
                        entity = (canvas?.tokens?.controlled[0]?.actor ?? game.user.character) as
                            | Actor.Stored<'character'>
                            | undefined;
                        break;
                    case 'target':
                        entity = game.user.targets.values().next().value?.actor as Actor.Stored<'character'>;
                        break;
                    case 'attached':
                        entity = options?.triggerEntity?.entity.parent as Actor.Stored<'character'> | undefined;
                        break;

                    default: {
                        entity =
                            (fromUuidSync<Actor.Stored<'character'>>(entityHandle) as Actor.Stored<'character'>) ??
                            game.actors.filter((e) => e.name === entityHandle)[0];

                        if (entity && !CustomActor.isCharacterActor(entity)) {
                            throw new UncomputableError(
                                `Entity is not an actor. Initiative only exists for Actors`,
                                options.source,
                                options.formula,
                                props
                            );
                        }
                    }
                }

                if (!entity) {
                    throw new UncomputableError(
                        `Entity "${entityHandle}" not found`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                const combatants = game.combat?.getCombatantsByActor(entity) ?? [];
                return combatants[0]?.initiative ?? fallbackValue;
            },
            fetchFromParent: (
                formula: string,
                opt: { fallback?: Primitive | symbol; top?: boolean } = { fallback: Symbol('undefined') }
            ): Primitive => {
                opt.fallback = typeof opt.fallback !== 'symbol' ? opt.fallback : options.defaultValue;

                if (options.triggerEntity?.entity instanceof CustomItem) {
                    const parentEntity = opt?.top
                        ? options?.triggerEntity?.entity?.parent
                        : options?.triggerEntity?.entity?.getParent();

                    if (!parentEntity) {
                        return opt.fallback;
                    }

                    const returnValue = castToPrimitive(
                        new Formula(formula).computeStatic(parentEntity.getRollData(), {
                            ...options,
                            defaultValue: opt.fallback
                        }).result
                    );

                    mathInstance.import(this.importCustomFunctions(mathInstance, props, options), {
                        override: true
                    });

                    return returnValue;
                } else {
                    throw new UncomputableError(
                        'fetchFromParent() is only usable in Items',
                        options.source,
                        options.formula,
                        props
                    );
                }
            },
            fetchFromActor: (
                actorName: string,
                formula: string,
                fallbackValue: Primitive | symbol = Symbol('undefined')
            ): Primitive => {
                fallbackValue = typeof fallbackValue !== 'symbol' ? fallbackValue : options.defaultValue;

                let actor;
                switch (actorName) {
                    case 'selected':
                        actor = canvas?.tokens?.controlled[0]?.actor ?? game.user.character;
                        break;
                    case 'target':
                        actor = game.user.targets.values().next().value?.actor;
                        break;
                    default:
                        actor = game.actors.filter((e) => e.name === actorName)[0];
                }

                // If actor was found
                if (actor) {
                    const actorProps = (actor.system as CharacterActorDataModel).props;

                    const returnValue = castToPrimitive(
                        new Formula(formula).computeStatic(actorProps, {
                            ...options,
                            defaultValue: fallbackValue
                        }).result
                    );

                    mathInstance.import(this.importCustomFunctions(mathInstance, props, options), {
                        override: true
                    });

                    return returnValue;
                }

                return fallbackValue;
            },
            fetchFromUuid: (
                uuid: string,
                formula: string,
                fallback: Primitive | symbol = Symbol('undefined')
            ): Primitive => {
                fallback = typeof fallback !== 'symbol' ? fallback : options.defaultValue;

                const entity = fromUuidSync<CustomActor | CustomItem>(uuid);

                if (!(entity instanceof CustomActor || entity instanceof CustomItem)) {
                    return fallback;
                }

                if (!entity) {
                    return fallback;
                }

                const returnValue = castToPrimitive(
                    new Formula(formula).computeStatic((entity.system as CharacterActorDataModel).props, {
                        ...options,
                        defaultValue: fallback
                    }).result
                );

                mathInstance.import(this.importCustomFunctions(mathInstance, props, options), {
                    override: true
                });

                return returnValue;
            },
            switchCase: (expression: Primitive, ...args: Primitive[]): Primitive => {
                while (args.length > 1 && args.shift() !== expression) {
                    args.shift();
                }
                return args.shift() ?? null;
            },
            setInitiative: (
                entityHandle: string,
                formula: string,
                fallbackValue: Primitive | symbol = Symbol('undefined')
            ): Primitive => {
                fallbackValue = typeof fallbackValue !== 'symbol' ? fallbackValue : options.defaultValue;

                let entity: Actor.Stored<'character'> | undefined;
                switch (entityHandle) {
                    case 'self':
                        if (!options.triggerEntity) {
                            throw new UncomputableError(
                                `Missing entity. Make sure, that you provide the triggering Entity in the Options of Formula or ComputablePhrase`,
                                options.source,
                                options.formula,
                                props
                            );
                        }

                        if (!CustomActor.isCharacterActor(options.triggerEntity.entity)) {
                            throw new UncomputableError(
                                `Entity is not an actor. Initiative only exists for Actors`,
                                options.source,
                                options.formula,
                                props
                            );
                        }
                        entity = options.triggerEntity.entity as Actor.Stored<'character'>;
                        break;
                    case 'selected':
                        entity = (canvas?.tokens?.controlled[0]?.actor ?? game.user.character) as
                            | Actor.Stored<'character'>
                            | undefined;
                        break;
                    case 'target':
                        entity = game.user.targets.values().next().value?.actor as Actor.Stored<'character'>;
                        break;
                    case 'attached':
                        entity = options?.triggerEntity?.entity.parent as Actor.Stored<'character'> | undefined;
                        break;

                    default: {
                        entity =
                            (fromUuidSync<Actor.Stored<'character'>>(entityHandle) as Actor.Stored<'character'>) ??
                            game.actors.filter((e) => e.name === entityHandle)[0];

                        if (entity && !CustomActor.isCharacterActor(entity)) {
                            throw new UncomputableError(
                                `Entity is not an actor. Initiative only exists for Actors`,
                                options.source,
                                options.formula,
                                props
                            );
                        }
                    }
                }

                if (!entity) {
                    throw new UncomputableError(
                        `Entity "${entityHandle}" not found`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                const actorProps = entity.getRollData();

                const value = castToPrimitive(
                    new Formula(formula).computeStatic(
                        { ...props, target: actorProps },
                        {
                            ...options,
                            defaultValue: fallbackValue
                        }
                    ).result
                );

                const newInit = Math.max(0, Number(value));

                if (Number.isNaN(newInit)) {
                    throw new UncomputableError(
                        `New initiative ${value} is not a number`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                const combatants = game.combat?.getCombatantsByActor(entity) ?? [];
                for (const combatant of combatants) {
                    void game.combat?.setInitiative(combatant.id, newInit);
                }
                entity.render(false);

                mathInstance.import(this.importCustomFunctions(mathInstance, props, options), {
                    override: true
                });

                return newInit;
            },
            setPropertyInEntity: (
                entityName: string,
                propertyName: string | string[],
                formula: string,
                fallbackValue: Primitive | symbol = Symbol('undefined')
            ): Primitive => {
                fallbackValue = typeof fallbackValue !== 'symbol' ? fallbackValue : options.defaultValue;

                let entity: CustomActor | CustomItem | undefined;
                switch (entityName) {
                    case 'self':
                        if (!options.triggerEntity) {
                            throw new UncomputableError(
                                `Missing entity. Make sure, that you provide the triggering Entity in the Options of Formula or ComputablePhrase`,
                                options.source,
                                options.formula,
                                props
                            );
                        }
                        entity = options.triggerEntity.entity;
                        break;
                    case 'selected':
                        entity = (canvas?.tokens?.controlled[0]?.actor ?? game.user.character) as
                            | CustomActor
                            | undefined;
                        break;
                    case 'target':
                        entity = game.user.targets.values().next().value?.actor as CustomActor;
                        break;
                    case 'attached':
                        entity = options?.triggerEntity?.entity.parent as CustomActor | undefined;
                        break;
                    case 'item':
                        if (!options.linkedEntity) {
                            throw new UncomputableError(
                                `Missing entity. Make sure, that you provide the linked Entity in the Options of Formula or ComputablePhrase`,
                                options.source,
                                formula,
                                props
                            );
                        }
                        entity = options.linkedEntity;
                        break;

                    default:
                        entity = game.actors.filter((e) => e.name === entityName)[0];
                }

                if (!entity) {
                    throw new UncomputableError(
                        `Entity "${entityName}" not found`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                const actorProps = entity.getRollData();

                const value = castToPrimitive(
                    new Formula(formula).computeStatic(
                        { ...props, target: actorProps },
                        {
                            ...options,
                            defaultValue: fallbackValue
                        }
                    ).result
                );

                const uuid = entity.uuid!.replaceAll('.', '-');

                const keys = typeof propertyName === 'string' ? [propertyName] : propertyName;
                const diff: { system: { props: Record<string, JSONValue> } } = { system: { props: {} } };
                keys.forEach((key) => (diff.system.props[key] = value));

                if (Object.keys(options.updates).some((key) => key === uuid)) {
                    foundry.utils.mergeObject(options.updates, { [uuid]: diff });
                } else {
                    options.updates[uuid] = diff;
                }

                mathInstance.import(this.importCustomFunctions(mathInstance, props, options), {
                    override: true
                });

                return value;
            },
            setValues: (uuid: string | string[], ...updateArgs: string[]): string => {
                if (updateArgs.length % 2 != 0) {
                    throw new UncomputableError(
                        `The amount of update arguments must be a multiple of 2, but you have only ${updateArgs.length}`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                const uuids = typeof uuid === 'string' ? [uuid] : uuid;

                return uuids
                    .map((uuid) => {
                        const entity = fromUuidSync<CustomActor | CustomItem>(uuid);
                        if (!(entity instanceof CustomActor || entity instanceof CustomItem)) {
                            Logger.error(`"${uuid}" couldn't be resolved to an Actor or Item`);
                            return `${uuid} => ERROR`;
                        }

                        const diff: { system: { props: Record<string, JSONValue> } } = {
                            system: { props: {} }
                        };
                        for (let i = 0; i < updateArgs.length / 2; i++) {
                            const key = updateArgs[i * 2];
                            const formula = updateArgs[i * 2 + 1];

                            diff.system.props[key] = castToPrimitive(
                                new Formula(formula).computeStatic({ ...props, target: entity.getRollData() }, options)
                                    .result
                            );
                        }

                        const formattedUuid = uuid.replaceAll('.', '-');
                        if (Object.keys(options.updates).some((key) => key === uuid)) {
                            foundry.utils.mergeObject(options.updates, { [formattedUuid]: diff });
                        } else {
                            options.updates[formattedUuid] = diff;
                        }

                        return `${entity.name} => ${JSON.stringify(diff.system.props)}`;
                    })
                    .join(', ');
            },
            notify: (messageType: string, message: string): string => {
                const validTypes = ['info', 'warn', 'error'];
                if (!validTypes.includes(messageType)) {
                    throw new UncomputableError(
                        `Message-Type "${messageType}" is not valid`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                ui!.notifications[messageType as 'info' | 'warn' | 'error'](message);
                return message;
            },
            escapeQuotes: (value: string): string => {
                return value.replaceAll("'", "\\'");
            },
            array: (...values: Primitive[]): Primitive[] => {
                if (values.length === 1) {
                    const firstVal = values[0];

                    if (typeof firstVal === 'string') {
                        return firstVal.split(',');
                    } else {
                        return [firstVal];
                    }
                } else {
                    return values;
                }
            },
            printEffects: ({
                uuid,
                active,
                tags,
                format
            }: {
                uuid?: string;
                active?: boolean;
                tags?: Array<string>;
                format?: 'list' | 'table' | 'list-detailed';
            }): string => {
                // Active is true by default
                active = active ?? true;

                // Format is list by default
                format = format ?? 'list';

                uuid = uuid ?? (props.uuid as string);

                const entity = fromUuidSync<CustomActor<'character'> | CustomItem<'equippableItem'>>(uuid) as
                    | CustomActor<'character'>
                    | CustomItem<'equippableItem'>;

                if (!entity) {
                    throw new UncomputableError(
                        `Uncomputable token "printEffects({uuid: ${uuid}, active: ${active}})" : uuid not found`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                if (!TemplateSystem.isAppliedTemplateSystem(entity.templateSystem)) {
                    throw new UncomputableError(
                        `Uncomputable token "printEffects({uuid: ${uuid}, active: ${active}})" : invalid uuid`,
                        options.source,
                        options.formula,
                        props
                    );
                }

                const effects = Array.from(entity.allApplicableEffects())
                    .filter((effect) => {
                        if (active && effect.disabled) {
                            return false;
                        }

                        if (tags !== undefined && tags.length > 0) {
                            for (const tag of tags) {
                                if (effect.tags.includes(tag)) {
                                    return true;
                                }
                            }

                            return false;
                        }

                        return true;
                    })
                    .sort((a, b) => a.name.localeCompare(b.name));

                if (format === 'list') {
                    return `<ul><li>${effects.map((effect) => effect.name).join('</li><li>')}</li></ul>`;
                } else if (format === 'list-detailed') {
                    return `<ul><li>${effects.map((effect) => `<b>${effect.name}</b>: ${effect.description}`).join('</li><li>')}</li></ul>`;
                } else {
                    const effectsString = [];

                    for (const effect of effects) {
                        effectsString.push(`<td>${effect.name}</td><td>${effect.description}</td>`);
                    }

                    return `<table><tr>${effectsString.join('</tr><tr>')}</tr></table>`;
                }
            }
        };

        return customFunctions;
    }
}
