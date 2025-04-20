import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const commands = [
    new SlashCommandBuilder().setName("tldr").setDescription("Summarize a message"),
    new SlashCommandBuilder().setName("test").setDescription("Testing yo ass"),
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
            const todaysMessages = await tldr(interaction);
            await interaction.reply(todaysMessages);
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
        return messageDate >= today;
    });

    return todaysMessages;
}

client.login(process.env.DISCORD_TOKEN);