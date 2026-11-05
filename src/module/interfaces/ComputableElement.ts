/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Primitive } from '../definitions.js';
import { CharacterActorDataModel } from '../documents/model/actorModel.js';
import TemplateSystem from '../documents/TemplateSystem.js';
import { ComponentRenderOptions } from '../sheets/components/Component.js';

/**
 * A function to compute a phrase
 */
export type ComputeFunction = {
    key: string;
    function: (additionalProps?: CharacterActorDataModel['props']) => Primitive;
    context: TemplateSystem;
};

export type ComputeParameters = {
    key: string;
    formula: string;
    context: TemplateSystem;
    options?: ComponentRenderOptions;
};

export function isComputeFunction(arg: ComputeFunction | ComputeParameters): arg is ComputeFunction {
    return typeof (arg as ComputeFunction).function === 'function';
}

export function isComputeParameters(arg: ComputeFunction | ComputeParameters): arg is ComputeParameters {
    return typeof (arg as ComputeParameters).formula === 'string';
}

/**
 * ComputableElement Interface
 * Implement this to have your component compute values on sheet loading
 */
export default interface ComputableElement {
    key?: string;

    /**
     * Returns a record of functions indexed by component keys to compute the value of the component
     * @param entity The entity triggering the computation
     * @param options Some additional options for computation
     * @param keyOverride Override the component's key if necessary. This new key must be used in place of the component's key if set.
     * @returns A record of functions indexed by component keys
     */
    getComputeFunctions(
        entity: TemplateSystem,
        options?: ComponentRenderOptions,
        keyOverride?: string
    ): Array<ComputeFunction | ComputeParameters>;

    /**
     * Returns a record of nullified values to ensure a clean slate before computation
     * @param valueKeys All keys returned by the getComputeFunctions of this element
     * @param entity The entity triggering the computation
     * @returns A record of all the keys to reset on the global props record. The keys should be set to `null` to be fully recomputed.
     */
    resetComputeValue(valueKeys: Array<string>, entity: TemplateSystem): Record<string, Primitive>;
}

/**
 * ComputableElement tester
 * @param element The element to test
 * @returns If the element implements ComputableElement
 */
export function isComputableElement(element: unknown): element is ComputableElement {
    return (element as ComputableElement).getComputeFunctions !== undefined;
}
