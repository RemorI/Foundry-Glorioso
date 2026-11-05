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
import { CustomActorSheetV2 } from './CustomActorSheetV2.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CustomActorSheetV2}
 * @ignore
 */
export class TemplateSheetV2 extends CustomActorSheetV2 {
    static DEFAULT_OPTIONS = {
        window: {
            controls: [
                {
                    label: 'CSB.TemplateActions.ConfigureTemplateSettings',
                    icon: 'fas fa-window',
                    action: 'configureTemplateSettings',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                },
                {
                    label: 'CSB.TemplateActions.ConfigureHiddenAttributes',
                    icon: 'fas fa-eye-slash',
                    action: 'configureHiddenAttributes',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                },
                {
                    label: 'CSB.TemplateActions.ConfigureAttributeBars',
                    icon: 'fas fa-bars-progress',
                    action: 'configureAttributeBars',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                },
                {
                    label: 'CSB.TemplateActions.ReloadCharacterSheets',
                    icon: 'fas fa-arrows-rotate',
                    action: 'reloadCharacterSheets',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                }
            ]
        },
        actions: {
            configureTemplateSettings: TemplateSheetV2.configureTemplateSettings,
            configureHiddenAttributes: TemplateSheetV2.configureHiddenAttributes,
            configureAttributeBars: TemplateSheetV2.configureAttributeBars,
            reloadCharacterSheets: TemplateSheetV2.reloadCharacterSheets
        }
    };
    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/actor/v2/actor-_template-sheet.hbs`;
            },
            classes: super.PARTS.form.classes
        }
    };
    static configureTemplateSettings(_event, _target) {
        void this.actor.templateSystem.editTemplateSettings();
    }
    static configureHiddenAttributes(_event, _target) {
        void this.actor.templateSystem.configureAttributes();
    }
    static configureAttributeBars(_event, _target) {
        void this.actor.templateSystem.editAttributeBars();
    }
    static reloadCharacterSheets(_event, _target) {
        void this.actor.templateSystem.reloadAllSheets();
    }
}
//# sourceMappingURL=TemplateSheetV2.js.map
