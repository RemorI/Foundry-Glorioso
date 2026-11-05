/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AnyObject } from 'fvtt-types/utils';

import { DefinedPrimitive, JSONValue, Primitive } from '../definitions.js';
import CustomActor from '../documents/CustomActor.js';
import CustomItem from '../documents/CustomItem.js';
import { CharacterActorDataModel } from '../documents/model/actorModel.js';
import TemplateSystem from '../documents/TemplateSystem.js';
import { UncomputableError } from '../errors/UncomputableError.js';
import Logger from '../Logger.js';
import { postAugmentedChatMessage } from '../utils.js';
import Formula from './Formula.js';

export type DefferedUpdate = {
    /** Properties to update in the entity (must be in system.props) */
    system: Pick<CharacterActorDataModel, 'props'>;
};

/**
 * Options to modify the computation of a computable phrase
 */
export type ComputablePhraseOptions = {
    /** The reference of the computation, to be able to use functions that depends on a line in a dynamic table */
    reference?: string;

    /** The source of the computation. Used for debugging only */
    source?: string;

    /** Default value to use in case a UncomputableError occurs */
    defaultValue?: Primitive;

    /** Indicates if formula should compute its explanation. Saves time if turned off. */
    computeExplanation?: boolean;

    /** List of the keys available in this computation. Can be used in the `ref` function to determine if a reference is computable. */
    availableKeys?: string[];

    /** Entity triggering the computation */
    triggerEntity?: TemplateSystem;

    /** Additional entity used in the computation. Currently used in Item Container computations */
    linkedEntity?: CustomItem;

    /** Should errors and warnings be suppressed ? */
    suppressErrorLogs?: boolean;
};

/**
 * Class holding computed phrase details, for explanation
 */
export default class ComputablePhrase {
    /**
     * The initial phrase to be computed
     */
    private _rawPhrase: string;

    /**
     * The built phrase with every inner formula replaced with a unique identifier
     */
    private _buildPhrase?: string;

    /**
     * All the inner formulas computed, assigned with a unique identifier
     */
    private _computedFormulas: Record<string, Formula> = {};

    /** List of updates to make at the end of a computation. Populated at computation time with the calls to the `setPropertyInEntity` function. */
    private _updates: Record<string, DefferedUpdate> = {};

    /**
     * Constructs new ComputablePhrase with a phrase to compute
     * @param phrase The phrase to compute
     */
    constructor(phrase: Primitive) {
        this._rawPhrase = String(phrase).trim();
    }

    /**
     * Gets the raw formula
     */
    get formula() {
        let phrase = this._buildPhrase!;
        for (const key in this._computedFormulas) {
            phrase = phrase.replaceAll(key, this._computedFormulas[key].raw);
        }

        return phrase;
    }

    /**
     * Gets the computed formula, i.e. the raw formula with all token replaced by their parsed values
     */
    get parsed() {
        let phrase = this._buildPhrase!;
        for (const key in this._computedFormulas) {
            phrase = phrase.replaceAll(key, this._computedFormulas[key].parsed);
        }

        return phrase;
    }

    /**
     * Gets the phrase ready for replacements
     */
    get buildPhrase() {
        return this._buildPhrase;
    }

    /**
     * Gets the resulting phrase, i.e. the fully computed values
     */
    get result() {
        let phrase = this._buildPhrase!;
        for (const key in this._computedFormulas) {
            phrase = phrase.replace(key, this._computedFormulas[key].result);
        }

        return phrase;
    }

    /**
     * Gets the computed formulas of the phrase, for building purposes
     */
    get values() {
        return this._computedFormulas;
    }

    /**
     * Posts phrase as a Chat Message
     * @param options Chat message options
     * @see https://foundryvtt.com/api/interfaces/foundry.types.ChatMessageData.html
     */
    postMessage(options: ChatMessage.CreateData) {
        void postAugmentedChatMessage({ buildPhrase: this.buildPhrase!, values: this.values }, options);
    }

    /**
     * Computes everything in the phrase, including dynamic data such as rolls and user inputs
     * @param props Properties used for computation
     * @param options Options to compute the phrase
     * @returns The updated computable phrase
     * @throws {UncomputableError} If a variable can not be computed
     */
    async compute(
        props: AnyObject,
        options: ComputablePhraseOptions = {
            computeExplanation: false,
            availableKeys: [],
            suppressErrorLogs: false
        }
    ): Promise<ComputablePhrase> {
        Logger.debug('Computing ' + this._rawPhrase);

        const phrase = this._rawPhrase;

        let localVars = {};

        const computedFormulas: Record<string, Formula> = {};
        let nComputed = 0;

        const throwUncomputableError = (message: string, source: string = ''): void => {
            throw new UncomputableError(
                message,
                source,
                '(Script-Expression)',
                options.triggerEntity?.entity.getRollData()
            );
        };

        const processFormulas = async ({ buildPhrase, expression }: { buildPhrase: string; expression: string }) => {
            const allFormulas = this._extractFormulas(expression);

            for (const textFormula of allFormulas) {
                const computedId = '${form' + nComputed + '}$';

                if (textFormula.startsWith('${') && textFormula.endsWith('}$')) {
                    // Recurse to handle potential sub-scripts
                    const processedFormula = await processFormulas({
                        buildPhrase: textFormula.substring(2).slice(0, -2),
                        expression: textFormula.substring(2).slice(0, -2)
                    });

                    const formula = new Formula(processedFormula.expression);

                    // options.defaultValue = undefined;
                    await formula.compute(props, {
                        localVars,
                        ...options
                    });

                    // Saves formula data
                    computedFormulas[computedId] = formula;
                    buildPhrase = buildPhrase.replace(textFormula, computedId);

                    expression = expression.replace(textFormula, formula.result);

                    localVars = {
                        ...localVars,
                        ...formula.localVars
                    };

                    if (formula.hasUpdates()) {
                        foundry.utils.mergeObject(this._updates, formula.updates);
                    }
                } else if (textFormula.startsWith('%{') && textFormula.endsWith('}%')) {
                    // Recurse to handle potential sub-scripts
                    const processedFormula = await processFormulas({
                        buildPhrase: textFormula.substring(2).slice(0, -2),
                        expression: textFormula.substring(2).slice(0, -2)
                    });

                    const AsyncFunction = async function () {}.constructor;

                    let result;

                    try {
                        // AsyncFunction is unsafe by design
                        // oxlint-disable-next-line @typescript-eslint/no-unsafe-call
                        result = (await AsyncFunction(
                            'entity',
                            'linkedEntity',
                            'localVars',
                            'options',
                            'throwUncomputableError',
                            processedFormula.expression
                        )(
                            options.triggerEntity?.entity,
                            options.linkedEntity,
                            localVars,
                            options,
                            throwUncomputableError
                        )) as Primitive;
                    } catch (err) {
                        if (options.defaultValue !== null && options.defaultValue !== undefined) {
                            result = options.defaultValue;

                            if (!options.suppressErrorLogs) {
                                Logger.error((err as Error).message, err);
                            }
                        } else {
                            throw err;
                        }
                    }

                    result = this._castScriptResult(result);

                    const formula = new Formula(String(result));
                    await formula.compute(props, {
                        localVars,
                        ...options
                    });

                    // Saves formula data
                    computedFormulas[computedId] = formula;
                    buildPhrase = buildPhrase.replace(textFormula, computedId);

                    expression = expression.replace(textFormula, String(result));

                    if (formula.hasUpdates()) {
                        foundry.utils.mergeObject(this._updates, formula.updates);
                    }
                }

                nComputed++;
            }

            return { buildPhrase, expression };
        };

        const processedFormula = await processFormulas({ buildPhrase: phrase, expression: phrase });

        this._buildPhrase = processedFormula.buildPhrase;
        this._computedFormulas = computedFormulas;

        if (Object.keys(this._updates).length > 0) {
            Logger.debug('Updating documents', this._updates);

            const uuids: string[] = Object.keys(this._updates);

            for (const uuid of uuids) {
                const document: CustomActor | CustomItem = (await fromUuid<CustomActor | CustomItem>(
                    uuid.replaceAll('-', '.')
                )) as CustomActor | CustomItem;
                await document.update(this._updates[uuid]);
            }
        }

        return this;
    }

    /**
     * Computes the phrase without any dynamic data such as rolls and user inputs. If rolls or user inputs syntax are present, will throw an error.
     * @param props Properties used for computation
     * @param options Options to compute the phrase
     * @returns The updated computable phrase
     * @throws {UncomputableError} If a variable can not be computed
     */
    computeStatic(
        props: AnyObject,
        options: ComputablePhraseOptions = {
            computeExplanation: false,
            availableKeys: [],
            suppressErrorLogs: false
        }
    ): ComputablePhrase {
        Logger.debug('Computing ' + this._rawPhrase);

        const phrase = this._rawPhrase;

        let localVars = {};

        const computedFormulas: Record<string, Formula> = {};
        let nComputed = 0;

        const throwUncomputableError = (message: string, source: string = ''): void => {
            throw new UncomputableError(
                message,
                source,
                '(Script-Expression)',
                options.triggerEntity?.entity.getRollData()
            );
        };

        const processFormulas = ({ buildPhrase, expression }: { buildPhrase: string; expression: string }) => {
            const allFormulas = this._extractFormulas(expression);

            for (const textFormula of allFormulas) {
                const computedId = '${form' + nComputed + '}$';

                if (textFormula.startsWith('${') && textFormula.endsWith('}$')) {
                    // Recurse to handle potential sub-scripts
                    const processedFormula = processFormulas({
                        buildPhrase: textFormula.substring(2).slice(0, -2),
                        expression: textFormula.substring(2).slice(0, -2)
                    });

                    const formula = new Formula(processedFormula.expression);

                    // options.defaultValue = undefined;
                    formula.computeStatic(props, {
                        localVars,
                        ...options
                    });

                    // Saves formula data
                    computedFormulas[computedId] = formula;
                    buildPhrase = buildPhrase.replace(textFormula, computedId);

                    expression = expression.replace(textFormula, formula.result);

                    localVars = {
                        ...localVars,
                        ...formula.localVars
                    };
                } else if (textFormula.startsWith('%{') && textFormula.endsWith('}%')) {
                    // Recurse to handle potential sub-scripts
                    const processedFormula = processFormulas({
                        buildPhrase: textFormula.substring(2).slice(0, -2),
                        expression: textFormula.substring(2).slice(0, -2)
                    });

                    let result;

                    try {
                        // Function is unsafe by design
                        // oxlint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-implied-eval
                        result = Function(
                            'entity',
                            'linkedEntity',
                            'localVars',
                            'options',
                            'throwUncomputableError',
                            processedFormula.expression
                        )(
                            options.triggerEntity?.entity,
                            options.linkedEntity,
                            localVars,
                            options,
                            throwUncomputableError
                        ) as Primitive;
                    } catch (err) {
                        if (options.defaultValue !== null && options.defaultValue !== undefined) {
                            result = options.defaultValue;

                            if (!options.suppressErrorLogs) {
                                Logger.error((err as Error).message, err);
                            }
                        } else {
                            throw err;
                        }
                    }

                    result = this._castScriptResult(result);

                    const formula = new Formula(String(result));
                    formula.computeStatic(props, {
                        localVars,
                        ...options
                    });

                    // Saves formula data
                    computedFormulas[computedId] = formula;
                    buildPhrase = buildPhrase.replace(textFormula, computedId);

                    expression = expression.replace(textFormula, String(result));
                }

                nComputed++;
            }

            return { buildPhrase, expression };
        };

        const processedFormula = processFormulas({ buildPhrase: phrase, expression: phrase });

        this._buildPhrase = processedFormula.buildPhrase;
        this._computedFormulas = computedFormulas;

        return this;
    }

    /**
     * Computes a phrase, including dynamic data such as rolls and user inputs
     * @param phrase The phrase to compute
     * @param props Properties used for computation
     * @param options Options to compute the phrase
     * @returns The computable phrase
     * @throws {UncomputableError} If a variable can not be computed
     */
    static async computeMessage(
        phrase: string,
        props: AnyObject,
        options: ComputablePhraseOptions = {
            computeExplanation: false,
            availableKeys: [],
            suppressErrorLogs: false
        }
    ): Promise<ComputablePhrase> {
        const computablePhrase = new ComputablePhrase(phrase);
        await computablePhrase.compute(props, options);

        return computablePhrase;
    }

    /**
     * Computes a phrase without any dynamic data such as rolls and user inputs. If rolls or user inputs syntax are present, will throw an error.
     * @param phrase The phrase to compute
     * @param props Properties used for computation
     * @param options Options to compute the phrase
     * @returns The computable phrase
     * @throws {UncomputableError} If a variable can not be computed
     */
    static computeMessageStatic(
        phrase: string,
        props: AnyObject,
        options: ComputablePhraseOptions = {
            computeExplanation: false,
            availableKeys: [],
            suppressErrorLogs: false
        }
    ): ComputablePhrase {
        const computablePhrase = new ComputablePhrase(phrase);
        computablePhrase.computeStatic(props, options);

        return computablePhrase;
    }

    /**
     * Extracts formulas & scripts from a raw computable phrase
     * @param expression The expression in which to extract Formulas
     * @returns The array of extracted formulas and scripts
     */
    private _extractFormulas(expression: string) {
        const formulaType = 'formula';
        const scriptType = 'script';

        const formulaBrackets = ['${', '}$'];
        const scriptBrackets = ['%{', '}%'];

        let nFormulaBrackets = 0;
        let nScriptBrackets = 0;

        const extracted = [];
        let currentExtract = '';

        let extracting = null;

        for (let i = 0; i < expression.length; i++) {
            const currentChar = expression.charAt(i);
            const nextChar = expression.charAt(i + 1);

            const currentPair = currentChar + nextChar;

            if (currentPair === formulaBrackets[0]) {
                nFormulaBrackets++;
                if (!extracting) {
                    extracting = formulaType;
                }
            } else if (currentPair === scriptBrackets[0]) {
                nScriptBrackets++;
                if (!extracting) {
                    extracting = scriptType;
                }
            } else if (currentPair === formulaBrackets[1]) {
                nFormulaBrackets--;
                if (nFormulaBrackets === 0 && extracting === formulaType) {
                    extracting = null;
                    extracted.push(currentExtract + currentPair);
                    currentExtract = '';
                }
            } else if (currentPair === scriptBrackets[1]) {
                nScriptBrackets--;
                if (nScriptBrackets === 0 && extracting === scriptType) {
                    extracting = null;
                    extracted.push(currentExtract + currentPair);
                    currentExtract = '';
                }
            }

            if (extracting) {
                currentExtract += currentChar;
            }
        }

        return extracted;
    }

    /**
     * Casts a value to a Defined Primitive
     * @param value The value to cast
     * @returns The casted value
     */
    private _castScriptResult(value: JSONValue): DefinedPrimitive {
        if (value === undefined) {
            return 'undefined';
        }

        if (value === null) {
            return 'null';
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
            return 'object';
        }

        if (!(typeof value === 'number' || typeof value === 'boolean')) {
            return `'${value.toString()}'`;
        }

        return value;
    }

    /**
     * Returns the fully computed phrase as a string
     */
    toString() {
        return this.result;
    }
}

globalThis.ComputablePhrase = ComputablePhrase;
