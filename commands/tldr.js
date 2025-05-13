import { getOpenAI } from '../config/openai.js';
import dotenv from 'dotenv';

dotenv.config();

export default async function tldr(interaction) {
    await interaction.deferReply();
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
    if(!messagesToAI) {
        await interaction.editReply("ingen beskeder brors 🤡");
        return;
    }
    const returnMessage = await summarize(messagesToAI);
    await interaction.editReply(returnMessage);
}

async function summarize(messages) {
    const openai = getOpenAI();
    const model = process.env.OPENAI_MODEL || "microsoft/phi-4-reasoning-plus:free";
    const messageToAI = `Opsummer følgende beskeder som en TLDR. start med en overskrift der passer til opsummering, dit svar må ikke være længere end 2000 tegn: ${messages} `;
    const response = await openai.chat.completions.create({
        model,
        messages: [{role: "user", content: messageToAI }]
    });
    return response.choices[0].message.content;
} 

