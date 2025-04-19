import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits, SlashCommandBuilder } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const commands = [
    new SlashCommandBuilder().setName("tldr").setDescription("Summarize a message"),
    new SlashCommandBuilder().setName("test").setDescription("Testing yo ass"),
]

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === "test") {
        await interaction.reply("GOOD MORNING VIETNAM");
    }
});

client.login(process.env.DISCORD_TOKEN);