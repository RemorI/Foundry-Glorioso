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

import { AnyObject } from 'fvtt-types/utils';

import { Primitive, TableJson, JSONValue } from './definitions.js';
import CustomActor from './documents/CustomActor.js';
import CustomItem from './documents/CustomItem.js';
import TemplateSystem from './documents/TemplateSystem.js';
import { ComponentJson } from './sheets/components/Component.js';
import { ContainerJson } from './sheets/components/Container.js';

/**
 * @ignore
 */
export const postCustomSheetRoll = async (messageText: string, alternative: boolean = false) => {
    const actor = (canvas!.tokens.controlled[0]?.actor ?? game.user.character) as CustomActor;

    if (actor && actor.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)) {
        try {
            await actor.roll(messageText, { alternative });
        } catch (err) {
            ui.notifications.error((err as Error).message);
        }
    } else {
        ui.notifications.error(game.i18n.localize('CSB.ChatCommands.ActorNotFound'));
    }
};

/**
 * Posts a chat message with a computed phrase data
 * @ignore
 */
export const postAugmentedChatMessage = async (
    textContent: Pick<ComputablePhrase, 'buildPhrase' | 'values'>,
    msgOptions: ChatMessage.CreateData,
    { messageMode, create }: { messageMode?: string; create: boolean } = { create: true }
) => {
    messageMode = messageMode ?? (game.settings.get<string, string>('core', 'messageMode') as string);

    // chat-roll is just the html template for computed formulas
    const template_file = `systems/${game.system.id}/templates/chat/chat-roll.hbs`;
    const template_file_groups = `systems/${game.system.id}/templates/chat/chat-roll-dice-pools.hbs`;

    let phrase = textContent.buildPhrase;

    if (!phrase) {
        return;
    }

    const values = textContent.values;

    const rolls = [];
    const diceGroups = [];

    // Render all formulas HTMLs
    for (const key in values) {
        let formattedValue = String(values[key].result);
        if (values[key].explanation) {
            formattedValue = await foundry.applications.handlebars.renderTemplate(template_file, {
                rollData: values[key],
                jsonRollData: JSON.stringify(values[key]).replaceAll(/\[\[/g, '[').replaceAll(/]]/g, ']'),
                messageMode: messageMode
            });
        }

        if (phrase.startsWith('/')) {
            formattedValue = formattedValue.replaceAll(/"/g, '\\"');
        }

        // Using function for replace to ignore problems linked to '$' character in replace function
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_the_replacement
        phrase = phrase.replace(key, () => formattedValue);

        for (const roll of values[key].rolls) {
            const rollObject = Roll.fromData(roll.roll);
            rolls.push(rollObject);

            if (roll.expandRollInChatCard) {
                diceGroups.push(...getDiceGroupsFromRoll(rollObject, values[key].hidden));
            }
        }
    }

    phrase = phrase.replaceAll(/\n/g, '').trim();

    const diceGroupsRendered = await foundry.applications.handlebars.renderTemplate(template_file_groups, {
        dice: diceGroups,
        multipleDice: diceGroups.filter((group) => !group.hidden).length > 1,
        messageMode: messageMode
    });

    phrase += diceGroupsRendered;

    const chatRollData: Partial<ChatMessage.CreateData> & {
        messageMode?: string;
    } = {
        rolls
    };

    let whisper = null;

    // If setting expandRollVisibility is checked, we apply the appropriate whispers to the message
    if (game.settings.get(game.system.id, 'expandRollVisibility')) {
        const gmList = ChatMessage.getWhisperRecipients('GM');

        chatRollData.messageMode = 'public';
        switch (messageMode) {
            case 'gm':
                whisper = gmList;
                break;
            case 'blind':
                whisper = gmList;
                break;
            case 'self':
                whisper = [game.user];
                break;
            default:
                break;
        }
    } else {
        chatRollData.messageMode = messageMode;
    }

    const chatData = foundry.utils.mergeObject(
        msgOptions,
        foundry.utils.mergeObject(
            {
                content: phrase,
                whisper,
                sound: CONFIG.sounds.dice
            },
            chatRollData
        )
    ) as ChatMessage.CreateData;

    if (create) {
        // Final chat message creation
        if (
            Hooks.call('chatMessage', ui.chat, phrase, {
                user: game.user.id,
                speaker: chatData.speaker as ChatMessage.SpeakerData
            }) === false
        )
            return;

        return ChatMessage.create(chatData);
    } else {
        const cls = foundry.utils.getDocumentClass('ChatMessage');
        const msg = new cls(chatData);

        if (messageMode) {
            // @ts-expect-error outdated types
            // oxlint-disable-next-line @typescript-eslint/no-unsafe-call
            msg.applyMode(messageMode);
        }
        return msg.toObject();
    }
};

/**
 * @ignore
 */
export const removeNull = (obj: Record<string | number, unknown>) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === Object(obj[key])) {
            removeNull(obj[key] as Record<string | number | symbol, unknown>);
        } else if (obj[key] === null) {
            delete obj[key];
        }
    });
};

/**
 * @param value
 */
export const castToPrimitive = (value: Primitive): Primitive => {
    if (typeof value === 'string') {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }

        const numericValue = parseInt(value);
        if (!Number.isNaN(numericValue) && /^[-+]?\d+$/.test(value)) {
            return numericValue;
        }
    }

    return value;
};

export const getGameCollectionAsTemplateSystems = (
    collectionType: 'actor' | 'item' | undefined
): Array<TemplateSystem> => {
    switch (collectionType) {
        case 'actor':
            return game.actors.filter((actor) => actor instanceof CustomActor).map((actor) => actor.templateSystem);
        case 'item':
            return game.items.filter((item) => item instanceof CustomItem).map((item) => item.templateSystem);
        default:
            throw new Error(`Unknown entity type ${collectionType}`);
    }
};

export function getGameCollection(collectionType: 'actor'): Collection<CustomActor>;
export function getGameCollection(collectionType: 'item'): Collection<CustomItem>;
export function getGameCollection(
    collectionType: 'actor' | 'item' | undefined
): Collection<CustomActor> | Collection<CustomItem>;
export function getGameCollection(
    collectionType: 'actor' | 'item' | undefined
): Collection<CustomActor> | Collection<CustomItem> {
    switch (collectionType) {
        case 'actor':
            return game.actors as unknown as Collection<CustomActor>;
        case 'item':
            return game.items as unknown as Collection<CustomItem>;
        default:
            throw new Error(`Unknown entity type ${collectionType}`);
    }
}

export const getLocalizedRoleList = (keyType: 'number' | 'string'): object => {
    return Object.fromEntries(
        Object.entries(CONST.USER_ROLES).map(([key, value]) => [
            keyType == 'number' ? value : key,
            game.i18n.localize(`USER.Role${key.toLowerCase().capitalize()}`)
        ])
    );
};

export const getLocalizedPermissionList = (keyType: 'number' | 'string'): object => {
    return Object.fromEntries(
        Object.entries(CONST.DOCUMENT_OWNERSHIP_LEVELS).map(([key, value]) => [
            keyType == 'number' ? value : key,
            game.i18n.localize(`OWNERSHIP.${key}`)
        ])
    );
};

export type Alignment = 'left' | 'center' | 'right' | 'justify';
export type VerticalAlignment = 'top' | 'center' | 'bottom';

export const getLocalizedAlignmentList = (includeJustify: boolean = false): Record<Alignment, string> => {
    const alignments: Record<string, string> = {
        left: game.i18n.localize('CSB.ComponentProperties.Alignment.AlignLeft'),
        center: game.i18n.localize('CSB.ComponentProperties.Alignment.AlignCenter'),
        right: game.i18n.localize('CSB.ComponentProperties.Alignment.AlignRight')
    };

    if (includeJustify) {
        alignments.justify = game.i18n.localize('CSB.ComponentProperties.Alignment.AlignJustify');
    }

    return alignments;
};

export const getLocalizedVerticalAlignmentList = (): Record<VerticalAlignment, string> => {
    const alignments: Record<string, string> = {
        top: game.i18n.localize('CSB.ComponentProperties.VerticalAlignment.AlignTop'),
        center: game.i18n.localize('CSB.ComponentProperties.VerticalAlignment.AlignCenter'),
        bottom: game.i18n.localize('CSB.ComponentProperties.VerticalAlignment.AlignBottom')
    };

    return alignments;
};

export const updateKeysOnCopy = (
    components: Array<ComponentJson | null>,
    availableKeys: Set<string>
): Array<ComponentJson | null> => {
    for (const component of components) {
        //TODO remove this check once Table is composed of sub Components for Rows
        if (component) {
            if (component.key && availableKeys.has(component.key)) {
                let suffix = 1;
                const originalKey = component.key;

                do {
                    component.key = originalKey + '_copy' + suffix;
                    suffix++;
                } while (availableKeys.has(component.key));
            }

            const containerComponent = component as ContainerJson;

            if (containerComponent.contents && containerComponent.contents.length > 0) {
                if (Array.isArray((component as TableJson).contents[0])) {
                    //TODO remove this once Table is composed of sub Components for Rows
                    (component as TableJson).contents = (component as TableJson).contents.map((row) => {
                        return updateKeysOnCopy(row, availableKeys);
                    });
                } else {
                    containerComponent.contents = updateKeysOnCopy(
                        containerComponent.contents,
                        availableKeys
                    ) as Array<ComponentJson>;
                }
            }
        }
    }

    return components;
};

export function quoteString(value: Primitive): string | null | undefined {
    if (value && typeof value === 'string') {
        return `'${value}'`;
    }

    return value === null ? null : value?.toString();
}

export function fastSetFlag(scope: string, key: string, value: JSONValue) {
    void game.user.setFlag(scope, key, value);
    foundry.utils.setProperty(game.user.flags, `${scope}.${key}`, value);
}

export function trimProseMirrorEmptyValue(value?: string): string {
    if (value === undefined) {
        return '';
    }

    const htmlValue = $(`<div>${value}</div>`);
    htmlValue.find('br.ProseMirror-trailingBreak').remove();
    htmlValue.find('.ProseMirror-selectednode').removeClass('ProseMirror-selectednode').removeAttr('draggable');
    value = htmlValue.html();

    if (value === '<p></p>') {
        return '';
    }

    return value;
}

export type DicePool = {
    dice: Array<{
        faces: number;
        result: string;
        classes: string;
    }>;
    formula: string;
    total: number;
    flavor?: string;
    icon?: string;
    method?: string;
    hidden: boolean;
};

export function getDiceGroupsFromRoll(roll: Roll<AnyObject>, hidden?: boolean): Array<DicePool> {
    const groups = [];

    const currentPool: DicePool = {
        dice: [],
        formula: '',
        total: 0,
        hidden: hidden ?? false
    };
    let operator = '';

    for (const term of roll.terms) {
        if (term instanceof foundry.dice.terms.PoolTerm && term.rolls) {
            for (const roll of term.rolls) {
                groups.push(...getDiceGroupsFromRoll(roll, hidden));
            }
        }

        if (term instanceof foundry.dice.terms.ParentheticalTerm) {
            if (term.roll) {
                groups.push(...getDiceGroupsFromRoll(term.roll, hidden));
            }
        }

        if (term instanceof foundry.dice.terms.DiceTerm) {
            currentPool.formula += operator + term.expression;
            currentPool.total += term.total as number;
            const tooltip = term.getTooltipData();
            currentPool.flavor = tooltip.flavor;
            currentPool.icon = tooltip.icon;
            currentPool.method = tooltip.method;

            for (const roll of tooltip.rolls) {
                currentPool.dice.push({
                    faces: tooltip.faces,
                    result: roll.result,
                    classes: roll.classes
                });
            }
        } else if (term instanceof foundry.dice.terms.OperatorTerm) {
            operator = term.formula;
        }
    }

    if (currentPool.dice.length > 0) {
        groups.push(currentPool);
    }

    return groups;
}

export function isModuleActive(moduleName: string) {
    return game.modules.has(moduleName) && (game.modules.get(moduleName) as foundry.packages.Module).active;
}

export function getValueFromProseMirror(editor: foundry.applications.elements.HTMLProseMirrorElement) {
    return editor.querySelector('textarea')?.value ?? editor.value;
}

export function replaceValueInProseMirror(editor: foundry.applications.elements.HTMLProseMirrorElement, value: string) {
    const innerTextArea = editor.querySelector('textarea');

    if (innerTextArea) {
        innerTextArea.value = value;
    }

    editor.querySelector('.editor-content')!.innerHTML = value;
}
