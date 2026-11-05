/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import TemplateSystem from '../documents/TemplateSystem.js';
import { ComputablePhraseOptions } from '../formulas/ComputablePhrase.js';

/**
 * Attribute bar interface
 * Implement this to have your component generate an attribute bar
 */
export default interface AttributeBarElement {
    /**
     * @param entity The Template System to get the maximum from
     * @param options Options to compute the maximum
     * @param keyOverride An optional key to override the initial key of the attribute bar
     * @returns The maximum of the Attribute Bar
     */
    getMaxValue(entity: TemplateSystem, options?: ComputablePhraseOptions, keyOverride?: string): number;

    /**
     * @param entity The Template System to get the value from
     * @param options Options to compute the value
     * @param keyOverride An optional key to override the initial key of the attribute bar
     * @returns The value of the Attribute Bar
     */
    getValue(entity: TemplateSystem, options?: ComputablePhraseOptions, keyOverride?: string): number;

    /**
     * @returns A flag if the Attribute Bar is editable
     */
    isEditable(): boolean;
}

/**
 * Attribute bar tester
 * @param element The element to test
 * @returns If the element defines an attribute bar
 */
export function isAttributeBarElement(element: unknown): element is AttributeBarElement {
    return (
        (element as AttributeBarElement).getMaxValue !== undefined &&
        (element as AttributeBarElement).getValue !== undefined
    );
}
