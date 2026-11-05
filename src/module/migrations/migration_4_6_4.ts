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

import CustomActiveEffect from '../documents/CustomActiveEffect.js';
import CustomItem from '../documents/CustomItem.js';
import { beginMigration, finishMigration, logProgress } from './migrationUtils.js';

async function processMigration() {
    const versionNumber = '4.6.4';

    const activeEffectContainerItems = game.items.filter(
        (item) => item.type === 'activeEffectContainer'
    ) as Array<CustomItem>;

    const allEffects = [];

    for (const item of activeEffectContainerItems) {
        allEffects.push(...item.effects.filter((effect) => effect.getFlag(game.system.id, 'isPredefined') !== true));
    }

    if (allEffects.length === 0) return;

    const notification = beginMigration(versionNumber);

    for (let i = 0; i < allEffects.length; i++) {
        const effect = allEffects[i];

        logProgress(effect as CustomActiveEffect, versionNumber, i, allEffects.length, notification);
        await effect.setFlag(game.system.id, 'isPredefined', true);
    }

    finishMigration(versionNumber, notification);
}

export default {
    processMigration
};
