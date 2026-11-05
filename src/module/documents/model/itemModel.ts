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

import CustomItem from '../CustomItem.js';
import { BodyModel, DisplayModel, HeaderModel, HiddenPropsModel } from './baseModels.js';

const { ObjectField, NumberField, StringField, BooleanField } = foundry.data.fields;

class AbstractItemDataModel<Schema extends foundry.data.fields.DataSchema> extends foundry.abstract.TypeDataModel<
    Schema,
    CustomItem
> {}

const defineBaseItemDataModelSchema = () => {
    return {
        body: BodyModel(),
        templateSystemUniqueVersion: new NumberField({ required: false }),
        uniqueId: new StringField({ required: false })
    };
};

export type BaseItemDataModelSchema = ReturnType<typeof defineBaseItemDataModelSchema>;

export class BaseItemDataModel extends AbstractItemDataModel<BaseItemDataModelSchema> {
    static defineSchema() {
        return defineBaseItemDataModelSchema();
    }
}

const defineTemplateItemDataModelSchema = () => {
    return {
        ...defineBaseItemDataModelSchema(),

        display: DisplayModel(),

        header: HeaderModel(),
        hidden: HiddenPropsModel()
    };
};

export type TemplateItemDataModelSchema = ReturnType<typeof defineTemplateItemDataModelSchema>;

export class TemplateItemDataModel extends AbstractItemDataModel<TemplateItemDataModelSchema> {
    static defineSchema() {
        return defineTemplateItemDataModelSchema();
    }
}

const defineEquippableItemDataModelSchema = () => {
    return {
        ...defineTemplateItemDataModelSchema(),

        template: new StringField({ required: false }),
        props: new ObjectField({
            required: true
        }),

        container: new StringField({ required: false, nullable: true }),
        unique: new BooleanField({ required: false, nullable: true })
    };
};

export type EquippableItemDataModelSchema = ReturnType<typeof defineEquippableItemDataModelSchema>;

export class EquippableItemDataModel extends AbstractItemDataModel<EquippableItemDataModelSchema> {
    static defineSchema() {
        return defineEquippableItemDataModelSchema();
    }
}
