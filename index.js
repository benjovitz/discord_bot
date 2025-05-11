import http from 'http';
import pkg, { AttachmentBuilder } from 'discord.js';
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = pkg;
import { getRedisClient } from './config/redis.js';
import tldr from './commands/tldr.js';
import test from './commands/test.js';
import stfu from './commands/stfu.js';
import cafeen from './commands/cafeen.js';
import chancen from './commands/chancen.js';
import dotenv from 'dotenv';

dotenv.config();

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

const commands = [
  new SlashCommandBuilder().setName("tldr").setDescription("Summarize a message"),
  new SlashCommandBuilder().setName("test").setDescription("Testing yo ass"),
  new SlashCommandBuilder().setName("stfu").setDescription("Show today's most active users"),
  new SlashCommandBuilder().setName("cafeen").setDescription("Check if thommy is fire"),
  new SlashCommandBuilder()
    .setName("chancen")
    .setDescription("Challenge another user to a random roll!")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to challenge')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('max')
        .setDescription('The max number to roll')
        .setRequired(true)
    ),
];

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
  try {
    switch (commandName) {
      case "test":
        await test(interaction);
        break;
      case "tldr":
        await interaction.reply({ content: "2 sek", ephemeral: true });
        const tldrResult = await tldr(interaction);
        await interaction.followUp(tldrResult);
        break;
      case "stfu":
        await stfu(interaction);
        break;
      case "cafeen":
        await cafeen(interaction);
        break;
      case "chancen":
        await chancen(interaction);
        break;
      default:
        await interaction.reply("Invalid command");
        break;
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "Error", ephemeral: true });
  }
});

client.on('messageCreate', async message => {
  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (message.channel.id === channelId && !message.author.bot) {
    const isPullRequest = message.content.includes('https://github.com/benjovitz/discord_bot/pull');
    if (!isPullRequest) {
      await message.delete();
      await message.channel.send({
        content: `${message.author}, only GitHub pull request links are allowed in this channel.`,
        ephemeral: true
      });
    }
  }
});

client.on('messageCreate', async (message) => {
  const redisClient = getRedisClient();
  await redisClient.connect();
  const key = `${message.channel.guild.id}:${message.channel.id}`;
  const newMessageObject = {
    content: message.content,
    channelName: message.channel.name,
    authorName: message.author.displayName,
  };
  let data = await redisClient.get(key);
  data = data ? JSON.parse(data) : { messages: [] };
  data.messages.push(newMessageObject);
  await redisClient.set(key, JSON.stringify(data));
  await redisClient.quit();
});

client.login(process.env.DISCORD_TOKEN);

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
