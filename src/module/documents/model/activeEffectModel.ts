import CustomActiveEffect from '../CustomActiveEffect.js';
const { StringField, ArrayField } = foundry.data.fields;
const { ActiveEffectTypeDataModel } = foundry.data;

const defineCustomActiveEffectDataModelSchema = () => ({
    ...ActiveEffectTypeDataModel.defineSchema(),
    tags: new ArrayField(new StringField({ required: true }))
});

export type CustomActiveEffectDataModelSchema = ReturnType<typeof defineCustomActiveEffectDataModelSchema>;

export class CustomActiveEffectDataModel extends foundry.abstract.TypeDataModel<
    CustomActiveEffectDataModelSchema,
    CustomActiveEffect
> {
    static defineSchema() {
        return defineCustomActiveEffectDataModelSchema();
    }
}
