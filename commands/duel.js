import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default async function duel(interaction) {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('user');

    // Basic validation
    if (opponent.bot) {
        await interaction.reply({ content: "You can't duel a bot!", ephemeral: true });
        return;
    }
    if (opponent.id === challenger.id) {
        await interaction.reply({ content: "You can't duel yourself!", ephemeral: true });
        return;
    }

    // Create accept/decline buttons
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('accept_duel')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('decline_duel')
                .setLabel('Decline')
                .setStyle(ButtonStyle.Danger),
        );

    // Send the challenge message with buttons
    const response = await interaction.reply({
        content: `⚔️ **DUEL CHALLENGE!**\n<@${opponent.id}>, you have been challenged to a duel by <@${challenger.id}>!\nDo you accept?`,
        components: [row],
        fetchReply: true
    });

    try {
        // Wait for button interaction
        const confirmation = await response.awaitMessageComponent({
            filter: i => i.user.id === opponent.id, // Only the challenged user can respond
            time: 30_000 // 30 seconds timeout
        });

        if (confirmation.customId === 'accept_duel') {
            // Generate random outcome
            const winner = Math.random() < 0.5 ? challenger : opponent;
            const loser = winner.id === challenger.id ? opponent : challenger;

            await interaction.editReply({
                content: `⚔️ The duel between <@${challenger.id}> and <@${opponent.id}> is complete!\n\n🏆 <@${winner.id}> emerges victorious!\n💀 <@${loser.id}> has been defeated!`,
                components: [] // Remove the buttons
            });
        } else {
            await interaction.editReply({
                content: `🏳️ <@${opponent.id}> has declined the duel challenge.`,
                components: [] // Remove the buttons
            });
        }
    } catch (e) {
        // Handle timeout
        await interaction.editReply({
            content: `⌛ The duel challenge has expired.`,
            components: [] // Remove the buttons
        });
    }
} 