// Store when users last received a message
const userCooldowns = new Map();
const COOLDOWN_HOURS = 12;

export default async function offlineCheck(client) {
    client.on("messageCreate", async (message) => {
        if (message.author.bot) {
            return;
        }

        const member = message.member;
        const isOnline = member?.presence && member.presence.status !== 'offline';
        
    
        if (isOnline) {
            return;
        }

        const lastMessageTime = userCooldowns.get(message.author.id);
        const now = Date.now();
        
        if (lastMessageTime && (now - lastMessageTime) < (COOLDOWN_HOURS * 60 * 60 * 1000)) {
            return; 
        }

        const responses = [
            `Hvorfor er du på appear offline <@${message.author.id}>?? 💀`,
            `Ik chat når du på appear offline <@${message.author.id}>?? xdd`,
            `Kom online istedet for at lurke <@${message.author.id}>?? 💀`,	
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        message.reply(randomResponse);
        userCooldowns.set(message.author.id, now);
    });
}
