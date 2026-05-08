import SystemUtils from "../utils/systemUtils.js";

export class CSRoll {
    constructor(title, formula) {
        this.formula = formula;
        this.title = title;
        this.entityData = undefined;
        this.rollCard  = "systems/chroniclesystem/templates/chat/cs-stat-rollcard.html";
        this.results = [];
    }

    async doRoll(actor) {
        if (this.formula.pool - this.formula.dicePenalty <=0 ) {
            ui.notifications.info(SystemUtils.localize("CS.notifications.dicePoolInvalid"));
            return null;
        }
        const pool = Math.max(this.formula.pool, 1);
        const dices = pool + this.formula.bonusDice;
        const keep = Math.max(this.formula.pool - this.formula.dicePenalty, 0);
        const reroll = this.formula.reRoll > 0 ? `r${this.formula.reRoll}=1` : "";
        const modifier = this.formula.modifier || 0;
        const modifierFormula = modifier === 0 ? "" : ` ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
        const rollFormula = `${dices}d6${reroll}kh${keep}${modifierFormula}`;
        const resultRoll = Roll.create(rollFormula);
        await resultRoll.evaluate();
        this.results = resultRoll.dice[0]?.results ?? [];
        const messageId = this.formula.isUserChanged ? "CS.chatMessages.customRoll" : "CS.chatMessages.simpleRoll";
        let flavor =  SystemUtils.format(messageId, {name: actor.name, test: this.title});
        await resultRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: flavor
        });
        return resultRoll;
    }
}
