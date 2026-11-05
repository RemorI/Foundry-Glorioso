/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Primitive } from '../../definitions.js';
import ComputableElement, { ComputeParameters } from '../../interfaces/ComputableElement.js';
import { ComponentRenderOptions } from '../../sheets/components/Component.js';
import TemplateSystem from '../TemplateSystem.js';

/**
 * Simple computable element class, used initially to compute hidden attributes in the sheet
 */
export default class SimpleComputableElement implements ComputableElement {
    /**
     * @param key The key of the computable element, used to set it into the props
     * @param phrase The formula to compute
     */
    constructor(
        public readonly key: string,
        public readonly phrase: string
    ) {}

    /**
     * Get the function to compute the value of the component
     * @param _templateSystem The entity to compute the element from
     * @param options Options to compute the value
     * @param keyOverride An optional key to override the initial key of the prop
     * @returns The anonymous function to compute the property
     */
    getComputeFunctions(
        templateSystem: TemplateSystem,
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
                formula: this.phrase,
                context: templateSystem,
                options
            }
        ];
    }

    /**
     * Returns a record of nullified values to ensure a clean slate before computation
     * @param valueKeys All keys returned by the getComputeFunctions of this element
     */
    resetComputeValue(valueKeys: Array<string>): Record<string, Primitive> {
        const resetValues: Record<string, null> = {};

        for (const key of valueKeys) {
            foundry.utils.setProperty(resetValues, key, undefined);
        }

        return resetValues;
    }
}
