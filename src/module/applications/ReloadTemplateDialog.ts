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

import CustomActor from '../documents/CustomActor.js';
import CustomItem from '../documents/CustomItem.js';
import CustomToken from '../documents/CustomToken.js';
import TemplateSystem from '../documents/TemplateSystem.js';
import Logger from '../Logger.js';
import { getGameCollectionAsTemplateSystems } from '../utils.js';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

enum SCENE_SELECTION_OPTIONS {
    none = 'CSB.ReloadTemplates.SceneSelect.None',
    current = 'CSB.ReloadTemplates.SceneSelect.Current',
    all = 'CSB.ReloadTemplates.SceneSelect.All'
}

type ReloadTemplateApplicationContext = {
    documentType: 'item' | 'actor';
    documentTypeLocalized: string;
    type: 'Items' | 'Actors';
    SCENE_SELECTION_OPTIONS: typeof SCENE_SELECTION_OPTIONS;
    buttons: Array<{ type: 'submit' | 'button'; action?: string; icon?: string; label?: string }>;
};

export default class ReloadTemplatesDialog extends HandlebarsApplicationMixin(
    ApplicationV2<ReloadTemplateApplicationContext>
) {
    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            handler: ReloadTemplatesDialog.submitHandler,
            submitOnChange: false,
            closeOnSubmit: false
        },
        actions: {
            cancel: ReloadTemplatesDialog.cancel
        },
        window: {
            title: 'CSB.TemplateActions.ReloadSheetsDialog.Title',
            icon: 'fas fa-arrows-rotate',
            resizable: false,
            minimizable: true,
            contentClasses: ['standard-form']
        },
        position: {
            width: 'auto' as const,
            height: 'auto' as const
        },
        classes: ['custom-system-reloadTemplates']
    };

    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/_template/dialogs/reloadTemplates.hbs`;
            }
        },
        footer: {
            template: 'templates/generic/form-footer.hbs'
        }
    };

    static async submitHandler(this: ReloadTemplatesDialog, _event: Event, _form: HTMLFormElement, formData: FormData) {
        const includeActorsInGameDirectory = formData.get('actorsInGameDirectory') === 'true';
        const sceneSelection = formData.get('tokensInScenes');

        const entities = ([] as TemplateSystem[]).concat(
            (sceneSelection === 'all'
                ? Array.from(game.scenes).flatMap((scene) => Array.from(scene.tokens))
                : sceneSelection === 'current'
                  ? Array.from(game.scenes.get(game.user?.viewedScene ?? '')?.tokens ?? [])
                  : []
            )
                .filter(
                    (token: CustomToken) => !token.actorLink && token.actor && CustomActor.isCharacterActor(token.actor)
                )
                .map((token: CustomToken) => (token.actor as CustomActor).templateSystem),
            includeActorsInGameDirectory
                ? (game.actors.filter((actor) => CustomActor.isCharacterActor(actor)) as Array<CustomActor>).map(
                      (actor) => actor.templateSystem
                  )
                : []
        );

        const filteredCollection =
            this.entityType === 'item'
                ? entities
                      .flatMap((entity) => Array.from(entity.items))
                      .filter((item: CustomItem) => item.system.template === this.entity.id)
                      .map((item: CustomItem) => item.templateSystem)
                : entities;

        await this.reloadTemplatesOfEntities(
            getGameCollectionAsTemplateSystems(this.entityType)
                .filter((entity) => entity.entity.system.template === this.entity.id)
                .concat(filteredCollection)
        );

        await this.close();
    }

    public async reloadTemplatesOfEntities(entities: TemplateSystem[]): Promise<void> {
        let counter = 1;

        const notification = ui.notifications.info('', { progress: true });

        return Promise.all(
            entities.map((entity) =>
                entity
                    .reloadTemplate()
                    .then(() => this.logReloadProgress(entity, counter++, entities.length, notification))
            )
        ).then(() => this.finishReloadProgress(entities.length, notification));
    }

    private logReloadProgress(
        entity: TemplateSystem,
        current: number,
        max: number,
        notification: foundry.applications.ui.Notifications.Notification
    ): void {
        Logger.log(`Reloaded ${entity.entity.name} (${entity.uuid}): ${current} / ${max}`);

        notification.update({
            message: game.i18n.format('CSB.ProgressBar.ReloadingTemplates', {
                NAME: entity.entity.name,
                UUID: entity.uuid!,
                CURRENT: String(current),
                MAX: String(max)
            }),
            pct: current / max
        });
    }

    private finishReloadProgress(max: number, notification: foundry.applications.ui.Notifications.Notification): void {
        Logger.log(`Reloading Templates of Documents finished (reloaded ${max} documents)`);
        notification.update({
            message: game.i18n.format('CSB.ProgressBar.ReloadingTemplatesFinished', { MAX: String(max) }),
            pct: 1
        });
    }

    static async cancel(this: ReloadTemplatesDialog, _event: PointerEvent, _target: HTMLElement) {
        await this.close();
    }

    private entityType: 'actor' | 'item';

    constructor(private readonly entity: CustomActor | CustomItem) {
        super();

        if (!this.entity.templateSystem.entityType) {
            throw new Error(`Cannot reload templates from entity ${this.entity.uuid}, unknown entity type`);
        }

        this.entityType = this.entity.templateSystem.entityType;
    }

    protected async _prepareContext(options: never) {
        const context = await super._prepareContext(options);

        context.documentType = this.entityType;
        context.type = this.entity instanceof Actor ? 'Actors' : 'Items';
        context.documentTypeLocalized = game.i18n.localize(`DOCUMENT.${context.type}`);
        context.SCENE_SELECTION_OPTIONS = SCENE_SELECTION_OPTIONS;

        context.buttons = [
            { type: 'submit', icon: 'fa-solid fa-arrows-rotate', label: 'CSB.ReloadTemplates.Reload' },
            { type: 'button', action: 'cancel', icon: 'fa-solid fa-xmark', label: 'Cancel' }
        ];

        return context;
    }
}
