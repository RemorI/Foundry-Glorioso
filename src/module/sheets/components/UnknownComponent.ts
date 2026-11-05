/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { JSONObject } from '../../definitions.js';
import TemplateSystem from '../../documents/TemplateSystem.js';
import Component, { ComponentJson, ComponentProps, ComponentRenderOptions } from './Component.js';
import Container from './Container.js';

/**
 * @ignore
 * @module
 */

export type UnknownComponentProps = ComponentProps & {
    originalJSON: JSONObject;
};

class UnknownComponent extends Component {
    /**
     * Original JSON
     */
    protected _originalJSON: JSONObject;

    /**
     * Label constructor
     */
    constructor(props: UnknownComponentProps) {
        super(props);

        this._originalJSON = props.originalJSON;
    }

    protected async _getElement(
        entity: TemplateSystem,
        isEditable: boolean = true,
        options: ComponentRenderOptions = {}
    ): Promise<JQuery> {
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
    static fromJSON(json: ComponentJson, templateAddress: string, parent?: Container): UnknownComponent {
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
    toJSON(): ComponentJson {
        return this._originalJSON as ComponentJson;
    }
}

/**
 * @ignore
 */
export default UnknownComponent;
