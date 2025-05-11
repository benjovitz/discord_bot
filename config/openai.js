import OpenAI from 'openai';

export function getOpenAI() {
    return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.AI_TOKEN,
    });
} 