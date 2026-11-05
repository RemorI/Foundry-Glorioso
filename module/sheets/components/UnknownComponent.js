/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import TemplateSystem from '../../documents/TemplateSystem.js';
import Component from './Component.js';
class UnknownComponent extends Component {
    /**
     * Original JSON
     */
    _originalJSON;
    /**
     * Label constructor
     */
    constructor(props) {
        super(props);
        this._originalJSON = props.originalJSON;
    }
    async _getElement(entity, isEditable = true, options = {}) {
        const jQElement = await super._getElement(entity, isEditable, options);
        if (TemplateSystem.isBuilderTemplateSystem(entity)) {
            jQElement.addClass('custom-system-editable-component');
            jQElement.on('click', () => {
                void foundry.applications.api.DialogV2.confirm({
                    window: {
                        title: game.i18n.localize('CSB.ComponentProperties.UnknownComponent.DeleteTitle'),
                        icon: 'fas fa-trash'
                    },
                    content: `<p>${game.i18n.localize('CSB.ComponentProperties.UnknownComponent.DeleteContent')}</p>`,
                    defaultYes: false,
                    modal: true,
                    rejectClose: true
                }).then((shouldDelete) => {
                    if (shouldDelete) {
                        void this.delete(entity);
                    }
                });
            });
        }
        jQElement.append(
            game.i18n.format('CSB.ComponentProperties.UnknownComponent.Label', {
                TYPE: String(this._originalJSON.type)
            })
        );
        jQElement.addClass('custom-system-unknown-component');
        return jQElement;
    }
    /**
     * Creates unknown component from JSON description
     * @override
     */
    static fromJSON(json, templateAddress, parent) {
        return new UnknownComponent({
            ...json,
            originalJSON: json,
            parent: parent,
            templateAddress: templateAddress
        });
    }
    /**
     * Returns serialized component
     * @override
     */
    toJSON() {
        return this._originalJSON;
    }
}
/**
 * @ignore
 */
export default UnknownComponent;
//# sourceMappingURL=UnknownComponent.js.map
