import dotenv from "dotenv";
import OpenAI from "openai";
import http from "http";
import pkg from 'discord.js';
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, InteractionResponseFlags } = pkg;
import { createClient } from "redis";


const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
});

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ],
});


const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        tls: true
    }
})



const commands = [
    new SlashCommandBuilder().setName("tldr").setDescription("Summarize a message"),
    new SlashCommandBuilder().setName("test").setDescription("Testing yo ass"),
    new SlashCommandBuilder().setName("stfu").setDescription("Show today's most active users"),
];

// Register slash commands
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

client.once("ready", async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
        console.log(`Logged in as ${client.user.tag}`);
    } catch (error) {
        console.error(error);
    }
});






client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case "test":
            await interaction.reply("GOOD MORNING VIETNAM");
            break;
        case "tldr":
            try {
                await interaction.reply({content: "2 sek", ephemeral: true});
                const todaysMessages = await tldr(interaction);
                await interaction.followUp(todaysMessages);
            } catch (error) {
                console.error(error);
                await interaction.reply({content: "Error", ephemeral: true});
            }
            break;
        case "stfu":
            try {
                await interaction.reply({content: "Udregner...", ephemeral: true});
                const leaderboard = await calculateTomsnak(interaction);
                await interaction.followUp(leaderboard);
            } catch (error) {
                console.error(error);
                await interaction.reply({content: "fejl", ephemeral: true});
            }
            break;
        default:
            await interaction.reply("Invalid command");
            break;
    }
});

async function tldr(interaction) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const todaysMessages = messages.filter(msg => {
        const messageDate = new Date(msg.createdTimestamp);
        if(!msg.author.bot && !msg.content.startsWith('/')) {
            return messageDate >= today;
        }
    });
    const messagesToAI =  todaysMessages.map(msg => `${msg.author.username}: ${msg.content}`).join('\n').trim();
    const returnMessage = await summarize(messagesToAI);
    return returnMessage;
}

async function calculateTomsnak(interaction) {
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
        return "No messages today yet";
    }

    sortedUsers.forEach((user, index) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "▫️";
        leaderboardMessage += `${medal} **${user[0]}**: ${user[1]} beskeder\n **stfu ${user[0]}**`;
    });

    return leaderboardMessage;
}

client.login(process.env.DISCORD_TOKEN);

/*
client.on('messageCreate', async (message) => {
    await redisClient.connect();
    const key = `${message.channel.guild.id}:${message.channel.id}`;

    const newMessageObject = {
        content : message.content,
        channelName : message.channel.name,
        authorName : message.author.displayName,
    }
   

    let data = await redisClient.get(key);
    data = data ? JSON.parse(data) : { messages: [] };

    data.messages.push(newMessageObject);

    await redisClient.set(key, JSON.stringify(data));

    await redisClient.quit();
});
*/

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.AI_TOKEN,
});

async function summarize(messages) {
    const key = messages;

    const messageToAI = `Opsummer følgende beskeder som en TLDR. Start med overskriften TLDR; dit svar må ikke være længere end 2000 tegn: ${messages}`;
    const response = await openai.chat.completions.create({
        model: "qwen/qwen3-4b:free",
        messages: [{role: "user", content: messageToAI }]
    });
    return response.choices[0].message.content;
}

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
  });
