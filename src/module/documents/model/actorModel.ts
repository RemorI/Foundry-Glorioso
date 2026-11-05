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

import CustomActor from '../CustomActor.js';
import { BodyModel, DisplayModel, HeaderModel, HiddenPropsModel } from './baseModels.js';

const { NumberField, StringField, BooleanField, ObjectField, SchemaField, TypedObjectField } = foundry.data.fields;

class AbstractActorDataModel<Schema extends foundry.data.fields.DataSchema> extends foundry.abstract.TypeDataModel<
    Schema,
    CustomActor
> {}

const defineTemplateActorDataModelSchema = () => ({
    body: BodyModel(),

    display: DisplayModel(),
    initiativeFormula: new StringField({
        required: false,
        trim: true
    }),

    header: HeaderModel(),
    hidden: HiddenPropsModel(),
    templateSystemUniqueVersion: new NumberField({ required: false }),

    attributeBar: new TypedObjectField(
        new SchemaField({
            max: new StringField({ required: true }),
            value: new StringField({ required: true }),
            editable: new BooleanField({ required: true })
        }),
        {
            required: true
        }
    )
});

export type TemplateActorDataModelSchema = ReturnType<typeof defineTemplateActorDataModelSchema>;

export class TemplateActorDataModel extends AbstractActorDataModel<TemplateActorDataModelSchema> {
    static defineSchema() {
        return defineTemplateActorDataModelSchema();
    }
}

const defineCharacterActorDataModelSchema = () => ({
    ...defineTemplateActorDataModelSchema(),
    template: new StringField({ required: false }),
    props: new ObjectField({
        required: true
    })
});

export type CharacterActorDataModelSchema = ReturnType<typeof defineCharacterActorDataModelSchema>;

export class CharacterActorDataModel extends AbstractActorDataModel<CharacterActorDataModelSchema> {
    static defineSchema() {
        return defineCharacterActorDataModelSchema();
    }
}
