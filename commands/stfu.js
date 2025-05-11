export default async function stfu(interaction) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const todaysMessages = messages.filter(msg => {
        const messageDate = new Date(msg.createdTimestamp);
        return !msg.author.bot && messageDate >= today;
    });

    // Count messages per user (by ID)
    const userMessageCount = new Map();
    todaysMessages.forEach(msg => {
        const userId = msg.author.id;
        const username = msg.author.username;
        const count = userMessageCount.get(userId)?.count || 0;
        userMessageCount.set(userId, { count: count + 1, username });
    });

    // Convert to array and sort by message count
    const sortedUsers = Array.from(userMessageCount.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10); // Get top 10 users

    let leaderboardMessage = "📊 **dagens største tomsnakkere** 📊\n\n";
    
    if (sortedUsers.length === 0) {
        await interaction.reply({ content: "No messages today yet", ephemeral: true });
        return;
    }

    sortedUsers.forEach(([userId, userData], index) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "▫️";
        leaderboardMessage += `${medal} <@${userId}> — **${userData.count}** besked${userData.count > 1 ? 'er' : ''}\n`;
    });

    const mostMessagesId = sortedUsers[0][0];
    leaderboardMessage += `\n**<@${mostMessagesId}> har trippet mest i dag**`;

    await interaction.reply({ content: leaderboardMessage });
} 