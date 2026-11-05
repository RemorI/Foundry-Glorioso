import Formula from '../formulas/Formula.js';
import Logger from '../Logger.js';

export default class CustomCombatant<SubType extends Combatant.SubType> extends Combatant<SubType> {
    //TODO change here
    _getInitiativeFormula() {
        const actorInitiativeFormula = this.actor?.system.initiativeFormula;
        const globalInitiativeFormula = game.settings.get(game.system.id, 'initFormula') as string;

        // Using || operator to check if the formula is empty as well as null / undefined
        CONFIG.Combat.initiative.formula = globalInitiativeFormula || '[1d20]';
        const initiativeFormula = actorInitiativeFormula || CONFIG.Combat.initiative.formula;

        Logger.debug('Initiative formula : ' + initiativeFormula);

        return initiativeFormula;
    }

    //@ts-expect-error Return type changed for CSB
    async getInitiativeRoll(rawFormula?: string) {
        return new Formula(rawFormula || this._getInitiativeFormula());
    }

    async rollInitiative(rawFormula: string) {
        const formula = await this.getInitiativeRoll(rawFormula);

        await formula.compute(this.actor?.getRollData() ?? {}, {
            defaultValue: '0',
            computeExplanation: true
        });

        return this.update({ initiative: parseInt(formula.result) });
    }
}
