export default async function stfu(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all text channels in the guild
    const channels = interaction.guild.channels.cache.filter(
        ch => ch.isTextBased && ch.viewable
    );

    // Aggregate messages from all channels
    const userMessageCount = new Map();

    async function fetchTodaysMessages(channel) {
        let lastId;
        let done = false;
        while (!done) {
            const options = { limit: 100 };
            if (lastId) options.before = lastId;
            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) break;

            for (const msg of messages.values()) {
                const messageDate = new Date(msg.createdTimestamp);
                if (messageDate < today) {
                    done = true;
                    break;
                }
                if (!msg.author.bot && messageDate >= today) {
                    const userId = msg.author.id;
                    const count = userMessageCount.get(userId) || 0;
                    userMessageCount.set(userId, count + 1);
                }
            }
            lastId = messages.last()?.id;
            if (!lastId) break;
        }
    }

    for (const channel of channels.values()) {
        try {
            await fetchTodaysMessages(channel);
        } catch (err) {
            // Ignore channels where fetching messages fails 
        }
    }

    // Sort and display
    const sortedUsers = Array.from(userMessageCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    let leaderboardMessage = "📊 **dagens største tomsnakkere** 📊\n\n";
    if (sortedUsers.length === 0) {
        await interaction.editReply({ content: "No messages today yet" });
        return;
    }

    sortedUsers.forEach(([userId, count], index) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "▫️";
        leaderboardMessage += `${medal} <@${userId}> — **${count}** besked${count > 1 ? 'er' : ''}\n`;
    });

    const mostMessagesId = sortedUsers[0][0];
    leaderboardMessage += `\n**<@${mostMessagesId}> har trippet mest i dag**`;

    await interaction.editReply({ content: leaderboardMessage });
} 