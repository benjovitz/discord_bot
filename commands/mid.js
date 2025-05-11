import { Client } from "discord.js";
import crypto from 'crypto'

export default async function getMidPerson(client) {
    client.once("ready", async (e) => {
        setInterval(async () => {
            const guild = client.guilds.cache.find(x => x.name === 'TEST_SERVER' || x.name === 'FUCKING FLEX');
            if (!guild) return;
        
            await guild.members.fetch();
    
            const role = guild.roles.cache.find(r => r.name === "Flexer");
            if (!role) return;
    
            const flexers = role.members.filter(x => !x.bot).map(member => member.user.id);
            const randomIndex = Math.floor(crypto.randomBytes(4).readUInt32LE(0) / (0xFFFFFFFF + 1) * flexers.length);

            const midMessageToMidPerson = `Fuck du er seriøst, så fucking mid <@${flexers[randomIndex]}>! 🤡 xdd`
            const channels = await guild.channels.fetch();

            const generalChannelId = channels.find(x => x.name === 'general')
            const channel = guild.channels.cache.get(generalChannelId.id);
            if (channel && channel.isTextBased()) {
                channel.send(midMessageToMidPerson);
            }
        }, 1000 * 60 * 60); 
    })
}