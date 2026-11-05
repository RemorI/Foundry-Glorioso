/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RollOptions } from '../definitions.js';
import Logger from '../Logger.js';
import { CustomActorSheetV2 } from '../sheets/actors/v2/CustomActorSheetV2.js';
import CustomActiveEffect from './CustomActiveEffect.js';
import CustomItem from './CustomItem.js';
import TemplateSystem from './TemplateSystem.js';

export const CustomActorTypes = ['character', '_template'] as const;

/**
 * Extend the base Actor document
 */
export default class CustomActor<SubType extends Actor.SubType = Actor.SubType> extends Actor<SubType> {
    static isCharacterActor(actor: unknown): actor is CustomActor<'character'> {
        return !!actor && actor instanceof CustomActor && actor.type === 'character';
    }

    static isTemplateActor(actor: unknown): actor is CustomActor<'_template'> {
        return !!actor && actor instanceof CustomActor && actor.type === '_template';
    }

    isCharacterActor(): this is CustomActor<'character'> {
        return CustomActor.isCharacterActor(this);
    }

    isTemplateActor(): this is CustomActor<'_template'> {
        return CustomActor.isTemplateActor(this);
    }

    static DEFAULT_IMG(actorType: Actor.SubType = 'base') {
        switch (actorType) {
            case 'character':
                return `icons/svg/mystery-man.svg`;
            case '_template':
                return `systems/${game.system.id}/img/template-logo.svg`;
            default:
                return `icons/svg/mystery-man.svg`;
        }
    }

    private _templateSystem?: TemplateSystem<CustomActor<SubType>>;

    get sheet(): CustomActorSheetV2 | null {
        return super.sheet as CustomActorSheetV2;
    }

    /**
     * Is this actor a Template?
     */
    get isAssignableTemplate(): boolean {
        return this.isTemplateActor();
    }

    /**
     * Fetch this entity
     * @deprecated
     */
    get entity(): this {
        Logger.warn(
            `${this.uuid}: entity.entity is now deprecated, since entity already is the Actor. please change all the "entity.entity" in your script for just "entity". This will be removed in CSB 7.0.0 - FoundryVTT 15`
        );
        return this;
    }

    /**
     * Template system in charge of generic templating handling
     * @return {TemplateSystem}
     */
    get templateSystem(): TemplateSystem {
        if (!this._templateSystem) {
            this._templateSystem = new TemplateSystem(this);
        }

        return this._templateSystem;
    }

    getItems(): Collection<CustomItem> {
        return new Collection(
            this.items
                .filter((item) => CustomItem.isEquippableItem(item))
                .filter(
                    (item) =>
                        item.system.container === null ||
                        item.system.container === undefined ||
                        item.system.container === ''
                )
                .map((item) => [item.id, item])
        );
    }

    protected async _preCreate(
        data: Actor.CreateData,
        _options: Actor.Database.PreCreateOptions,
        _user: User.Implementation
    ): Promise<boolean | void> {
        const baseDefaultImg = CustomActor.DEFAULT_IMG();
        const typeDefaultImg = CustomActor.DEFAULT_IMG(this.type);

        if (this.img === baseDefaultImg && typeDefaultImg !== baseDefaultImg) {
            this.updateSource({ img: typeDefaultImg });
            data.img = typeDefaultImg;
        }

        return true;
    }

    /**
     * @override
     * @ignore
     */
    _onCreate(data: Actor.CreateData, options: Actor.Database.OnCreateOperation, userId: string) {
        super._onCreate(data, options, userId);

        if (this.permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            if (!(data.flags?.[game.system.id] as Record<string, string> | undefined)?.version) {
                void this.setFlag(game.system.id, 'version', game.system.version);
            }
        }
    }

    async toggleStatusEffect(
        statusId: string,
        { active, overlay }: { active: boolean; overlay: boolean } = { active: false, overlay: false }
    ): Promise<ActiveEffect.Stored | boolean | undefined> {
        const status = CONFIG.statusEffects.find((e) => e.id === statusId);
        if (!status) throw new Error(`Invalid status ID "${statusId}" provided to Actor#toggleStatusEffect`);
        const existing: Array<CustomActiveEffect> = [];

        for (const effect of this.effects) {
            const statuses = effect.statuses;
            if (statuses.size === 1 && statuses.has(status.id) && effect.id)
                existing.push(effect as CustomActiveEffect);
        }

        // Remove the existing effects unless the status effect is forced active
        if (existing.length) {
            if (active) return true;
            await CustomActiveEffect.removeActiveEffects(this, existing);
            return false;
        }

        // Create a new effect unless the status effect is forced inactive
        if (!active && active !== undefined) return;
        const effect = await ActiveEffect.implementation.fromStatusEffect(statusId);
        if (overlay) {
            effect.updateSource({
                //@ts-expect-error Won't let us update flags
                'flags.core.overlay': true
            });
        }

        if (effect.getFlag(game.system.id, 'isPredefined')) {
            return CustomActiveEffect.addActiveEffect(this, effect.id!) as Promise<ActiveEffect.Stored>;
        } else {
            return ActiveEffect.implementation.create(effect, { parent: this, keepId: true });
        }
    }

    /**
     * Get all ActiveEffects that are created on this Item.
     * @yields {CustomActiveEffect}
     * @returns {Generator<CustomActiveEffect, void, void>}
     */
    //@ts-expect-error Type mismatch
    *allApplicableEffects({ excludeExternal = false, _excludeTransfer = true } = {}): Generator<
        CustomActiveEffect,
        void,
        void
    > {
        for (const effect of this.effects) {
            if (this.isCharacterActor()) {
                yield effect.computeEffectKeys(this, false);
            } else {
                yield effect as CustomActiveEffect;
            }
        }

        if (!excludeExternal) {
            for (const item of this.getItems()) {
                for (const effect of item.effects) {
                    if (effect.transfer) {
                        if (this.isCharacterActor()) {
                            yield effect.computeEffectKeys(this, false);
                        } else {
                            yield effect as CustomActiveEffect;
                        }
                    }
                }
            }
        }
    }

    /**
     * @override
     * @ignore
     */
    exportToJSON(options = {}) {
        super.exportToJSON({
            ...options,
            keepId: true
        });
    }

    /**
     * @override
     * @param {string} json
     * @inheritDoc
     * @ignore
     */
    async importFromJSON(json: string) {
        await super.importFromJSON(json);

        await this.update({
            system: {
                templateSystemUniqueVersion: (Math.random() * 0x100000000) >>> 0
            }
        });

        return this;
    }

    prepareData() {
        // Identify which special statuses had been active
        const specialStatuses = new Map<string, boolean>();
        for (const statusId of Object.values(CONFIG.specialStatusEffects)) {
            specialStatuses.set(statusId, this.statuses.has(statusId));
        }

        this.templateSystem.prepareData();

        // Apply special statuses that changed to active tokens
        let tokens;
        for (const [statusId, wasActive] of specialStatuses) {
            const isActive = this.statuses.has(statusId);
            if (isActive === wasActive) continue;
            tokens ??= this.getDependentTokens({ scenes: canvas.scene ?? undefined })
                .filter((t) => t.rendered)
                .map((t) => t.object);
            for (const token of tokens) {
                if (token) {
                    //@ts-expect-error Necessary workaround - it is done like that in the core code
                    token._onApplyStatusEffect(statusId, isActive);
                }
            }
        }
    }

    /**
     * @override
     * @inheritDoc
     * @ignore
     */
    getRollData() {
        return this.templateSystem.getRollData();
    }

    /**
     * Handle how changes to a Token attribute bar are applied to the Actor.
     * @param {string} attribute    The attribute path
     * @param {number} value        The target attribute value
     * @param {boolean} isDelta     Whether the number represents a relative change (true) or an absolute change (false)
     * @param {boolean} isBar       Whether the new value is part of an attribute bar, or just a direct value
     * @returns {Promise<documents.Actor>}  The updated Actor document
     * @ignore
     * @override
     */
    async modifyTokenAttribute(
        attribute: string,
        value: number,
        isDelta: boolean = false,
        isBar: boolean = true
    ): Promise<this | undefined> {
        const current = foundry.utils.getProperty(this.system, attribute) as { value: number };

        if (isBar && attribute.startsWith('attributeBar')) {
            const barDefinition = foundry.utils.getProperty(this.system, attribute) as {
                max: number;
                key: string;
            };
            if (barDefinition) {
                if (isDelta) value = Number(current.value) + value;

                value = Math.clamp(0, value, barDefinition.max);
                attribute = 'props.' + barDefinition.key;
                isBar = false;
                isDelta = false;
            }
        }

        return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
    }

    /**
     * Forward the roll function to the TemplateSystem
     * @returns {Promise<ComputablePhrase>} The rolled Computable Phrase
     */
    async roll(rollKey: string, options: RollOptions = {}): Promise<ComputablePhrase> {
        return this.templateSystem.roll(rollKey, options);
    }

    /**
     * Forwards the reload template function to the TemplateSystem
     */
    async reloadTemplate(templateId?: string) {
        return this.templateSystem.reloadTemplate(templateId);
    }
}

Hooks.on('preCreateItem', (item: CustomItem, _createData: unknown, _options: unknown, _userId: unknown) => {
    if (item.isOwned) {
        const actor = item.parent!;
        if (!actor.templateSystem.canOwnItem(item)) return false; // prevent creation
    }
});

Hooks.on('renderActorDirectory', (directory: foundry.applications.sidebar.tabs.ActorDirectory) => {
    const $html = $(directory.element);
    const entries = $html.find('li[data-entry-id]');
    entries.each((_idx, elt) => {
        if (elt.dataset.entryId) {
            const item = game.actors.get(elt.dataset.entryId);

            if (item && item.img === CustomActor.DEFAULT_IMG(item.type)) {
                $(elt).find('img').addClass('csb-filter-default-svg');
            }
        }
    });
});
