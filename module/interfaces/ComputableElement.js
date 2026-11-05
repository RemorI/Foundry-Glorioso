/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
export function isComputeFunction(arg) {
    return typeof arg.function === 'function';
}
export function isComputeParameters(arg) {
    return typeof arg.formula === 'string';
}
/**
 * ComputableElement tester
 * @param element The element to test
 * @returns If the element implements ComputableElement
 */
export function isComputableElement(element) {
    return element.getComputeFunctions !== undefined;
}
//# sourceMappingURL=ComputableElement.js.map
