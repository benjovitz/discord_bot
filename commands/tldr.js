import { getOpenAI } from '../config/openai.js';

export default async function tldr(interaction) {
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

async function summarize(messages) {
    const openai = getOpenAI();
    const messageToAI = `Opsummer følgende beskeder som en TLDR. Start med overskriften TLDR; dit svar må ikke være længere end 2000 tegn: ${messages}`;
    const response = await openai.chat.completions.create({
        model: "qwen/qwen3-4b:free",
        messages: [{role: "user", content: messageToAI }]
    });
    return response.choices[0].message.content;
} 