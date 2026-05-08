// noinspection JSUnusedLocalSymbols
export async function doRoll(actor, formula, thing, difficulty = 0) {
    const pool = Math.max(formula.pool - formula.dicePenalty, 1);
    const dices = pool + formula.bonusDice;
    const keep = Math.max(formula.pool - formula.dicePenalty, 0);
    const reroll = formula.reRoll > 0 ? `r${formula.reRoll}=1` : "";
    const modifier = formula.modifier || 0;
    const modifierFormula = modifier === 0 ? "" : ` ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
    const resultRoll = Roll.create(`${dices}d6${reroll}kh${keep}${modifierFormula}`);
    await resultRoll.evaluate();
    let flavor = thing + " test";
    await resultRoll.toMessage({
         speaker: ChatMessage.getSpeaker({ actor: actor }),
         flavor: flavor
     });
}
