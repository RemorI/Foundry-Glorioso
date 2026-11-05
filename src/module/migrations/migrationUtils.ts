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

import { JSONObject } from '../definitions.js';
import CustomActiveEffect from '../documents/CustomActiveEffect.js';
import type CustomActor from '../documents/CustomActor.js';
import CustomItem from '../documents/CustomItem.js';
import Logger from '../Logger.js';
import { ComponentJson } from '../sheets/components/Component.js';
import type { ContainerJson } from '../sheets/components/Container.js';
import { ExtensibleTableJson } from '../sheets/components/ExtensibleTable.js';

export function beginMigration(version: string): foundry.applications.ui.Notifications.Notification {
    return ui.notifications.info(`CSB: Migration to Version ${version} started`, { progress: true });
}

export function logProgress(
    document: CustomActor | CustomItem | CustomActiveEffect,
    version: string,
    current: number,
    total: number,
    notification: foundry.applications.ui.Notifications.Notification
): void {
    Logger.log('Processing migration ' + version + ' for ' + document.name + ' - ' + document.id);
    notification.update({
        message: `CSB: Migration to Version ${version}. Updating ${document.constructor.name} ${current + 1} / ${total}`,
        pct: current / total
    });
}

export function finishMigration(
    version: string,
    notification: foundry.applications.ui.Notifications.Notification
): void {
    notification.update({
        message: `CSB: Migration to Version ${version} finished`,
        pct: 1
    });
}

export function getActorsToMigrate(versionNumber: string): CustomActor[] {
    return game.actors.filter((actor) =>
        foundry.utils.isNewerVersion(versionNumber, actor.getFlag(game.system.id, 'version') as string)
    );
}

export function getItemsToMigrate(versionNumber: string): CustomItem[] {
    return game.items.filter((item) =>
        foundry.utils.isNewerVersion(versionNumber, item.getFlag(game.system.id, 'version') as string)
    );
}

export async function updateDocuments<T extends CustomActor | CustomItem>(
    documents: T[],
    versionNumber: string,
    callback: (document: T) => JSONObject,
    notification: foundry.applications.ui.Notifications.Notification
): Promise<void> {
    for (let i = 0; i < documents.length; i++) {
        const document = documents[i];

        logProgress(document, versionNumber, i, documents.length, notification);

        const diff = callback(document);

        await document.update(diff);
        // @ts-expect-error setFlag is not compatible between actor & item
        await document.setFlag(game.system.id, 'version', versionNumber);
    }
}

export async function reloadTemplatesInEmbeddedItems(
    actors: CustomActor[],
    versionNumber: string,
    notification: foundry.applications.ui.Notifications.Notification
): Promise<void> {
    const items = actors.flatMap((actor) => Array.from(actor.items));

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        logProgress(item, versionNumber, i, items.length, notification);

        try {
            await item.templateSystem.reloadTemplate();
        } catch (err) {
            Logger.error((err as Error).message, err);
        }

        await item.setFlag(game.system.id, 'version', versionNumber);
    }
}

export async function reloadTemplatesInDocuments<T extends CustomActor | CustomItem>(
    documents: T[],
    versionNumber: string,
    notification: foundry.applications.ui.Notifications.Notification
): Promise<void> {
    for (let i = 0; i < documents.length; i++) {
        const document = documents[i];

        logProgress(document, versionNumber, i, documents.length, notification);

        try {
            await document.templateSystem.reloadTemplate();
        } catch (err) {
            Logger.error((err as Error).message, err);
        }

        // @ts-expect-error setFlag is not compatible between actor & item
        await document.setFlag(game.system.id, 'version', versionNumber);
    }
}

export function updateComponents(
    component: ComponentJson,
    predicate: (component?: ComponentJson) => boolean,
    callback: (component: ComponentJson) => ComponentJson
): ComponentJson {
    if (predicate(component)) {
        component = callback(component);
    }

    if ((component as ContainerJson)?.contents) {
        const container = component as ContainerJson;

        (container.contents as Array<ComponentJson | Array<ComponentJson | undefined>>) = (
            container.contents ?? []
        ).map((subComp) => {
            if (Array.isArray(subComp)) {
                const tableContents: Array<ComponentJson | undefined> = (subComp as Array<ComponentJson>).map(
                    (subSubComp) => {
                        if (subSubComp) {
                            return updateComponents(subSubComp, predicate, callback);
                        }
                    }
                );

                return tableContents;
            } else {
                return updateComponents(subComp, predicate, callback);
            }
        });
    }

    if ((component as ExtensibleTableJson)?.rowLayout) {
        const extensibleTable = component as ExtensibleTableJson;

        extensibleTable.rowLayout = extensibleTable.rowLayout?.map((subComp) => {
            return updateComponents(subComp, predicate, callback);
        });
    }

    return component;
}

export function getComponentKeys(
    component: ComponentJson,
    predicate: (component?: ComponentJson) => boolean
): Set<string> {
    let allKeys = new Set<string>();
    if (component.key && predicate(component)) {
        allKeys.add(component.key);
    }

    if ((component as ContainerJson)?.contents) {
        const container = component as ContainerJson;

        (container.contents ?? []).forEach((subComp) => {
            if (Array.isArray(subComp)) {
                (subComp as Array<ComponentJson>).forEach((subSubComp) => {
                    if (subSubComp) {
                        allKeys = new Set([...allKeys, ...getComponentKeys(subSubComp, predicate)]);
                    }
                });
            } else {
                allKeys = new Set([...allKeys, ...getComponentKeys(subComp, predicate)]);
            }
        });
    }

    if ((component as ExtensibleTableJson)?.rowLayout) {
        const extensibleTable = component as ExtensibleTableJson;

        extensibleTable.rowLayout?.forEach((subComp) => {
            allKeys = new Set([...allKeys, ...getComponentKeys(subComp, predicate)]);
        });
    }

    return allKeys;
}
