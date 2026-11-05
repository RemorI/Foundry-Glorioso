import { JSONObject } from '../definitions.js';
import { postAugmentedChatMessage } from '../utils.js';

export default class CustomCombat<SubType extends Combat.SubType> extends Combat<SubType> {
    async rollInitiative(
        ids: Array<string> | string,
        { formula: rawFormula = null, updateTurn = true, messageOptions = {} }: Combat.InitiativeOptions = {}
    ) {
        // Structure input data
        ids = typeof ids === 'string' ? [ids] : ids;
        const chatRollMode = game.settings.get<string, string>('core', 'messageMode');

        // Iterate over Combatants, performing an initiative roll for each
        const updates = [];
        const messages = [];
        for (const [i, id] of ids.entries()) {
            // Get Combatant data (non-strictly)
            const combatant = this.combatants.get(id);
            if (!combatant?.isOwner) continue;

            // Produce an initiative roll for the Combatant
            const formula = await combatant.getInitiativeRoll(rawFormula ?? undefined);
            const phrase = new ComputablePhrase('${' + formula.raw + '}$');
            await phrase.compute(combatant.actor?.getRollData() ?? {}, {
                defaultValue: '0',
                computeExplanation: true,
                triggerEntity: combatant.actor?.templateSystem
            });
            updates.push({ _id: id, initiative: parseInt(phrase.result) });

            // If the combatant is hidden, use a private roll unless an alternative rollMode was explicitly requested
            const messageMode = (
                'messageMode' in messageOptions ? messageOptions.messageMode : combatant.hidden ? 'gm' : chatRollMode
            ) as string;

            // Construct chat message data
            const messageData = foundry.utils.mergeObject(
                {
                    speaker: foundry.documents.ChatMessage.implementation.getSpeaker({
                        actor: combatant.actor as Actor.Stored,
                        token: combatant.token as TokenDocument.Stored,
                        alias: combatant.name
                    }),
                    flavor: game.i18n.format('COMBAT.RollsInitiative', {
                        name: foundry.utils.escapeHTML(combatant.name ?? '')
                    }),
                    flags: { core: { initiativeRoll: true } }
                },
                messageOptions
            );

            const chatData = (await postAugmentedChatMessage(phrase, messageData, {
                create: false,
                messageMode
            })) as ChatMessage.CreateData;

            // Play 1 sound for the whole rolled set
            if (i > 0 && chatData) chatData.sound = null;
            messages.push(chatData);
        }
        if (!updates.length) return this;

        // Update combatants and combat turn
        const updateOptions: JSONObject = {
            turnEvents: false,
            combatTurn: undefined
        };
        if (!updateTurn) updateOptions.combatTurn = this.turn ?? undefined;
        await this.updateEmbeddedDocuments('Combatant', updates, updateOptions);

        // Create multiple chat messages
        await foundry.documents.ChatMessage.implementation.create(messages);
        return this;
    }
}
