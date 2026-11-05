/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { isFullBuilderTemplateEntity } from '../definitions.js';
import Logger from '../Logger.js';
import { isModuleActive } from '../utils.js';
import CustomActor from './CustomActor.js';
import CustomItem from './CustomItem.js';
export default class CustomActiveEffect extends ActiveEffect {
    static CONTAINER_ITEM;
    appliedKeys = new Set();
    _onCreate(effect, options, userId) {
        if (userId === game.user.id) {
            const flagUpdates = {};
            if (!effect.flags?.[game.system.id]?.version) {
                flagUpdates.version = game.system.version;
            }
            if (!this.getFlag(game.system.id, 'originalUuid') || isFullBuilderTemplateEntity(this.parent)) {
                flagUpdates.originalParentId = this.parent.id;
                flagUpdates.originalId = this.id;
                flagUpdates.originalUuid = this.uuid;
                flagUpdates.isFromTemplate = isFullBuilderTemplateEntity(this.parent);
            }
            if (Object.keys(flagUpdates).length > 0) {
                void this.update({
                    flags: {
                        [game.system.id]: flagUpdates
                    }
                });
            }
        }
        return super._onCreate(effect, options, userId);
    }
    get count() {
        if (!isModuleActive('statuscounter')) {
            return 1;
        }
        if (!this.statusCounter) {
            return 1;
        }
        return foundry.utils.getProperty(this, this.statusCounter.dataSource) ?? 1;
    }
    get tags() {
        return this.system.tags ?? [];
    }
    addApplyKey(key) {
        this.appliedKeys.add(key);
    }
    computeEffectKeys(target, shouldThrow = false) {
        if (!CustomActor.isCharacterActor(this.parent) && !CustomItem.isEquippableItem(this.parent)) {
            return this;
        }
        const props = {
            ...this.parent.getRollData(),
            target: target.getRollData()
        };
        let changeKeys = [];
        const computedChanges = [];
        for (const change of this.system.changes) {
            try {
                changeKeys = ComputablePhrase.computeMessageStatic(change.key, props, {
                    source: `activeEffect.${this.name}.key`,
                    triggerEntity: this.parent.templateSystem
                }).result.split(',');
                for (const key of changeKeys) {
                    let finalKey = key;
                    let refInTarget = false;
                    if (key.startsWith('target.')) {
                        finalKey = finalKey.substring(7);
                        refInTarget = true;
                    }
                    if (finalKey.startsWith('props')) {
                        finalKey = `system.${finalKey}`;
                    } else if (
                        !finalKey.startsWith('system') &&
                        target.templateSystem.getKeys().has(finalKey.split('.')[0])
                    ) {
                        finalKey = `system.props.${finalKey}`;
                    }
                    if (refInTarget) {
                        finalKey = `target.${finalKey}`;
                    }
                    computedChanges.push({ ...change, key: finalKey });
                }
            } catch (err) {
                if (shouldThrow) {
                    throw err;
                }
                Logger.error(
                    `Error when computing active effet value ${this.name} - ${change.key} for entity ${target.name} (parent entity : ${this.parent.name})`,
                    err,
                    { keys: changeKeys }
                );
            }
        }
        this.system.changes = computedChanges;
        return this;
    }
    computeEffectValue(target, change, shouldThrow = false) {
        if (!CustomActor.isCharacterActor(this.parent) && !CustomItem.isEquippableItem(this.parent)) {
            return change;
        }
        const props = {
            ...this.parent.getRollData(),
            target: target.getRollData()
        };
        try {
            let sanitizedKey = change.key;
            let refInTarget = false;
            if (sanitizedKey.startsWith('target.')) {
                sanitizedKey = sanitizedKey.substring(7);
                refInTarget = true;
            }
            sanitizedKey = sanitizedKey.substring(13);
            let reference = undefined;
            if (sanitizedKey.includes('.')) {
                const splitKey = sanitizedKey.split('.');
                reference = `${refInTarget ? 'target.' : ''}${splitKey[0]}.${splitKey[1]}`;
            }
            const value = ComputablePhrase.computeMessageStatic(change.value, props, {
                source: `activeEffect.${this.name}.value`,
                triggerEntity: this.parent.templateSystem,
                reference
            }).result;
            change = { ...change, value };
        } catch (err) {
            if (shouldThrow) {
                throw err;
            }
            Logger.error(
                `Error when computing active effet value ${this.name} - ${change.key} for entity ${target.name} (parent entity : ${this.parent.name})`,
                err
            );
        }
        return change;
    }
    /**
     * Determine whether a change from this ActiveEffect should be applied during the current phase. Systems and modules
     * may override this method to introduce additional conditions under which a change is applied.
     * @param {ActiveEffectChangeData} change    The change being considered.
     * @param {object} [options]                 Options which affect whether the change is applied.
     * @param {string} [options.phase]           The application phase currently being evaluated.
     * @param {string} [options.replacementData] Replacement data to be used as part of the change's application
     * @returns {boolean}                        Should the change be applied during this phase (or at all)?
     */
    shouldApplyChange(change, options) {
        if (this.appliedKeys.has(change.key)) {
            return false;
        }
        return super.shouldApplyChange(change, options);
    }
    /**
     * Apply this ActiveEffect to a target Document.
     * @param {Actor|Item|TokenDocument} targetDoc The Document to which this effect should be applied
     * @param {ActiveEffectChangeData} change      The change data being applied
     * @param {object} [options]                   Options affecting the change application
     * @param {object} [options.replacementData]   Data used to resolve "@" expressions in a string value
     * @param {boolean} [options.modifyTarget]     Modify the target Document with the updated value.
     * @returns {Record<string, unknown>} An object of property keys and their updated values
     */
    static applyChange(targetDoc, change, options) {
        change.effect.addApplyKey(change.key);
        change = change.effect.computeEffectValue(
            targetDoc instanceof TokenDocument ? targetDoc.actor : targetDoc,
            change,
            true
        );
        if (
            change.effect?.statusCounter &&
            ['add', 'subtract', 'multiply'].includes(change.type) &&
            !Number.isNaN(Number(change.value))
        ) {
            change.value = String(change.effect.statusCounter._multiplyDelta(Number(change.value)));
        }
        return super.applyChange(targetDoc, change, options);
    }
    /**
     * Create an ActiveEffect instance from status effect data.
     */
    static async _fromStatusEffect(statusId, effectData, options) {
        const statusEffect = CONFIG.statusEffects.find((e) => e.id === statusId);
        if (statusEffect && statusEffect.linkedEffectId) {
            const activeEffect = this.getPredefinedEffect(statusEffect.linkedEffectId);
            if (activeEffect) {
                return activeEffect;
            }
        }
        return super._fromStatusEffect(statusId, effectData, options);
    }
    /**
     * Adds or update the CustomActiveEffect to the predefined list
     */
    async addToPredefinedEffects() {
        const predefinedEffects = CustomActiveEffect.getContainerItem().effects;
        const existingEffect = predefinedEffects.getName(this.name);
        if (existingEffect) {
            await existingEffect.update(this.toJSON());
        } else {
            await CustomActiveEffect.getContainerItem().createEmbeddedDocuments('ActiveEffect', [this.toJSON()]);
        }
    }
    /**
     * Removes the CustomActiveEffect from the predefined list by its name
     */
    async removeFromPredefinedEffects() {
        const predefinedEffects = CustomActiveEffect.getContainerItem().effects;
        const existingEffect = predefinedEffects.getName(this.name);
        if (existingEffect) {
            await existingEffect.delete();
        }
    }
    static getContainerItem() {
        if (!this.CONTAINER_ITEM) {
            const foundItem = game.items?.find((item) => CustomItem.isActiveEffectContainer(item));
            if (!foundItem) {
                throw new Error('Container Item not found. Please reload.');
            }
            this.CONTAINER_ITEM = foundItem;
        }
        return this.CONTAINER_ITEM;
    }
    /**
     * Get the basic information of predefined Active Effects
     * @returns An array with the Ids and Names of the predefined Active Effects
     */
    static getPredefinedEffectsData() {
        if (!isModuleActive('dfreds-convenient-effects')) {
            return this.getContainerItem()
                .effects.map((effect) => {
                    return { id: effect.id, name: effect.name, tags: effect.tags };
                })
                .sort((a, b) => {
                    return a.name.localeCompare(b.name);
                });
        } else {
            const convenientEffectsApiSource = game.modules.get('dfreds-convenient-effects').api;
            return convenientEffectsApiSource
                .findEffects()
                .map((effect) => {
                    return { id: effect.id, name: effect.name, tags: effect.tags };
                })
                .sort((a, b) => {
                    return a.name.localeCompare(b.name);
                });
        }
    }
    static getPredefinedEffect(effectId) {
        if (!isModuleActive('dfreds-convenient-effects')) {
            return this.getContainerItem().effects.get(effectId);
        } else {
            const convenientEffectsApiSource = game.modules.get('dfreds-convenient-effects').api;
            return convenientEffectsApiSource.findEffect({ effectId });
        }
    }
    /**
     * Add a predefined Active Effect to an entity
     * @param entity The entity to add the effect to
     * @param effectId The predefined effect ID to add
     */
    static async addActiveEffect(entity, effectId) {
        if (!isModuleActive('dfreds-convenient-effects')) {
            const predefinedEffects = CustomActiveEffect.getContainerItem().effects;
            const existingEffect = predefinedEffects.get(effectId);
            if (existingEffect) {
                if (entity instanceof CustomActor) {
                    await entity.createEmbeddedDocuments('ActiveEffect', [existingEffect.toJSON()]);
                } else {
                    await entity.createEmbeddedDocuments('ActiveEffect', [existingEffect.toJSON()]);
                }
                return existingEffect;
            }
        } else {
            const convenientEffectsApiSource = game.modules.get('dfreds-convenient-effects').api;
            await convenientEffectsApiSource.addEffect({
                effectId: String(effectId),
                uuid: entity.uuid
            });
        }
    }
    /**
     * Removes a predefined Active Effect from an entity
     * @param entity The entity to add the effect to
     * @param effectId The predefined effect ID to add
     */
    static async removeActiveEffects(entity, effects) {
        const toRemoveNormally = [];
        if (!isModuleActive('dfreds-convenient-effects')) {
            toRemoveNormally.push(...effects.map((effect) => effect.id));
        } else {
            const convenientEffectsApiSource = game.modules.get('dfreds-convenient-effects').api;
            for (const effect of effects) {
                if (effect.getFlag('dfreds-convenient-effects', 'isConvenient')) {
                    await convenientEffectsApiSource.removeEffect({
                        effectId: effect.getFlag('dfreds-convenient-effects', 'ceEffectId'),
                        uuid: entity.uuid
                    });
                } else {
                    toRemoveNormally.push(effect.id);
                }
            }
        }
        if (entity instanceof CustomActor) {
            await entity.deleteEmbeddedDocuments('ActiveEffect', toRemoveNormally);
        } else {
            await entity.deleteEmbeddedDocuments('ActiveEffect', toRemoveNormally);
        }
    }
}
Hooks.on('applyActiveEffect', applyCustomActiveEffectChange);
function applyCustomActiveEffectChange(actor, change, current, _delta, changes) {
    if (change.type !== 'custom') {
        return;
    }
    try {
        const castCurrent = current;
        changes[change.key] = ComputablePhrase.computeMessageStatic(
            change.value,
            { ...actor.getRollData(), current: castCurrent },
            {
                source: `activeEffect.${change.key}.value`,
                triggerEntity: actor.templateSystem
            }
        ).result;
    } catch (_err) {
        changes[change.key] = 'ERROR';
    }
}
Hooks.on('preCreateActiveEffect', (effect) => {
    if (
        isModuleActive('dfreds-convenient-effects') &&
        effect.parent.type === 'activeEffectContainer' &&
        !effect?.flags?.['dfreds-convenient-effects']
    ) {
        const convenientEffectsApiSource = game.modules.get('dfreds-convenient-effects').api;
        effect.flags['dfreds-convenient-effects'] = {
            fromDrop: true
        };
        void convenientEffectsApiSource.createNewEffects({
            existingFolderId: effect.parent.id,
            effectsData: [effect.toJSON()]
        });
        return false;
    }
    let sourceUpdates = { 'flags.statuscounter.config.multiplyEffect': true };
    if (effect.parent.type === 'activeEffectContainer') {
        sourceUpdates = {
            ...sourceUpdates,
            [`flags.${game.system.id}.isPredefined`]: true,
            'flags.dfreds-convenient-effects.ceEffectId': effect.name?.slugify(),
            'flags.dfreds-convenient-effects.isConvenient': true,
            'flags.dfreds-convenient-effects.isViewable': true,
            'flags.dfreds-convenient-effects.isTemporary': false
        };
    }
    effect.updateSource(sourceUpdates);
    return true;
});
//# sourceMappingURL=CustomActiveEffect.js.map
