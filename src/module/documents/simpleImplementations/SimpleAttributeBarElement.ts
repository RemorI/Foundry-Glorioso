/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ComputablePhraseOptions } from '../../formulas/ComputablePhrase.js';
import AttributeBarElement from '../../interfaces/AttributeBarElement.js';
import CustomActor from '../CustomActor.js';
import TemplateSystem from '../TemplateSystem.js';

/**
 * Simple attribute bar class, used initially to compute custom attribute bars in sheets
 */
export default class SimpleAttributeBarElement implements AttributeBarElement {
    /**
     * @param key Attribute bar key
     * @param valueFormula Formula for the value of the Attribute bar
     * @param maxFormula Formula for the maximum of the Attribute bar
     * @param _isEditable Is the Attribute Bar editable?
     */
    constructor(
        private readonly key: string,
        private readonly valueFormula: string | number,
        private readonly maxFormula: string | number,
        private readonly _isEditable: boolean
    ) {}

    /**
     * @inheritdoc
     */
    getMaxValue(
        templateSystem: TemplateSystem<CustomActor<'character'>>,
        options?: ComputablePhraseOptions,
        keyOverride?: string
    ): number {
        return Number(
            ComputablePhrase.computeMessageStatic(String(this.maxFormula), templateSystem.entity.getRollData(), {
                ...options,
                source: keyOverride ?? this.key,
                availableKeys: Object.keys(templateSystem.entity.getRollData()),
                triggerEntity: templateSystem,
                defaultValue: 0
            }).result
        );
    }

    /**
     * @inheritdoc
     */
    getValue(
        templateSystem: TemplateSystem<CustomActor<'character'>>,
        options?: ComputablePhraseOptions,
        keyOverride?: string
    ): number {
        return Number(
            ComputablePhrase.computeMessageStatic(String(this.valueFormula), templateSystem.entity.getRollData(), {
                ...options,
                source: keyOverride ?? this.key,
                availableKeys: Object.keys(templateSystem.entity.getRollData()),
                triggerEntity: templateSystem,
                defaultValue: 0
            }).result
        );
    }

    /**
     * @inheritdoc
     */
    isEditable(): boolean {
        return this._isEditable;
    }
}
