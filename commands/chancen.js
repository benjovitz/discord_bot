import crypto from 'crypto';

export default async function chancen(interaction) {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('user');
    const max = interaction.options.getInteger('max');

    if (opponent.bot) {
        await interaction.reply({ content: "You can't challenge a bot!", ephemeral: true });
        return;
    }
    if (opponent.id === challenger.id) {
        await interaction.reply({ content: "You can't challenge yourself!", ephemeral: true });
        return;
    }
    if (max < 2) {
        await interaction.reply({ content: "Max number must be at least 2.", ephemeral: true });
        return;
    }

    // Roll for both users
    const challengerRoll = Math.floor(crypto.randomBytes(4).readUInt32LE(0) / (0xFFFFFFFF + 1)  * max) + 1;
    const opponentRoll = Math.floor(crypto.randomBytes(4).readUInt32LE(0) / (0xFFFFFFFF + 1)  * max) + 1;



    let resultMsg = `🎲 **Chancen!** 🎲\n<@${challenger.id}> vs <@${opponent.id}> (1-${max})\n\n`;
    resultMsg += `<@${challenger.id}> rolled **${challengerRoll}**\n`;
    resultMsg += `<@${opponent.id}> rolled **${opponentRoll}**\n\n`;

    if (challengerRoll > opponentRoll) {
        resultMsg += `🏆 <@${challenger.id}> wins!`;
    } else if (opponentRoll > challengerRoll) {
        resultMsg += `🏆 <@${opponent.id}> wins!`;
    } else {
        resultMsg += `🤝 It's a tie!`;
    }

    await interaction.reply({ content: resultMsg });
} 