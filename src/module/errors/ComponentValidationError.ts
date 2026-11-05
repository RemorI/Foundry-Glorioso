/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { JSONObject } from '../definitions.js';

export class ComponentValidationError extends Error {
    constructor(
        message: string,
        public readonly propertyName: string,
        public readonly sourceObject: JSONObject
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class RequiredFieldError extends ComponentValidationError {
    constructor(
        public readonly propertyName: string,
        public readonly sourceObject: JSONObject
    ) {
        super(
            game.i18n.format('CSB.ComponentProperties.Errors.RequiredFieldError', {
                PROPERTY_NAME: propertyName
            }),
            propertyName,
            sourceObject
        );
    }
}

export class AlphanumericPatternError extends ComponentValidationError {
    constructor(
        public readonly propertyName: string,
        public readonly sourceObject: JSONObject
    ) {
        super(
            game.i18n.format('CSB.ComponentProperties.Errors.AlphanumericPatternError', {
                PROPERTY_NAME: propertyName
            }),

            propertyName,
            sourceObject
        );
    }
}

export class NotUniqueError extends ComponentValidationError {
    constructor(
        public readonly propertyName: string,
        public readonly sourceObject: JSONObject
    ) {
        super(
            game.i18n.format('CSB.ComponentProperties.Errors.NotUniqueError', {
                PROPERTY_NAME: propertyName
            }),
            propertyName,
            sourceObject
        );
    }
}

export class NotGreaterThanZeroError extends ComponentValidationError {
    constructor(
        public readonly propertyName: string,
        public readonly sourceObject: JSONObject
    ) {
        super(
            game.i18n.format('CSB.ComponentProperties.Errors.NotGreaterThanZeroError', {
                PROPERTY_NAME: propertyName
            }),
            propertyName,
            sourceObject
        );
    }
}
