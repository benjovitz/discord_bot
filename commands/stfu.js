export default async function stfu(interaction) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const todaysMessages = messages.filter(msg => {
        const messageDate = new Date(msg.createdTimestamp);
        return !msg.author.bot && messageDate >= today;
    });

    // Count messages per user
    const userMessageCount = new Map();
    todaysMessages.forEach(msg => {
        const count = userMessageCount.get(msg.author.username) || 0;
        userMessageCount.set(msg.author.username, count + 1);
    });

    // Convert to array and sort by message count
    const sortedUsers = Array.from(userMessageCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Get top 10 users

    let leaderboardMessage = "📊 **dagens største tomsnakkere** 📊\n\n";
    
    if (sortedUsers.length === 0) {
        await interaction.reply({ content: "No messages today yet", ephemeral: true });
        return;
    }

    sortedUsers.forEach((user, index) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "▫️";
        leaderboardMessage += `${medal} **${user[0]}**: ${user[1]} beskeder\n  ${user[0]}`;
    });

    await interaction.reply({ content: leaderboardMessage, ephemeral: true });
} 