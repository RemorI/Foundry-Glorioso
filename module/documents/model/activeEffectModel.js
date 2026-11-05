const { StringField, ArrayField } = foundry.data.fields;
const { ActiveEffectTypeDataModel } = foundry.data;
const defineCustomActiveEffectDataModelSchema = () => ({
    ...ActiveEffectTypeDataModel.defineSchema(),
    tags: new ArrayField(new StringField({ required: true }))
});
export class CustomActiveEffectDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return defineCustomActiveEffectDataModelSchema();
    }
}
//# sourceMappingURL=activeEffectModel.js.map
