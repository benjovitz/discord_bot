import { Client } from "discord.js";
import crypto from 'crypto'

export default async function getMidPerson(client) {
    client.once("ready", async (e) => {
        setInterval(async () => {
            const guild = client.guilds.cache.find(x => x.name === 'TEST_SERVER' || x.name === 'FUCKING FLEX');
            if (!guild) return;
            const members = await guild.members.fetch();
            const memberNames = members.filter(x => !x.user.bot).map(e => e.user.id);
            const randomIndex = Math.floor(crypto.randomBytes(4).readUInt32LE(0) / (0xFFFFFFFF + 1) * memberNames.length);
            const nameOfMidUser = memberNames[randomIndex];
            //console.log(nameOfMidUser)
            const midMessageToMidPerson = `Fuck du er seriøst, så fucking mid <@${nameOfMidUser}>! xdd`

            const channels = await guild.channels.fetch()
            const generalChannel = channels.find(x => x.name === 'general');

            const roles = await guild
            console.log(roles.guild)

            // const channel = guild.channels.cache.get(generalChannel.id);
            // if (channel && channel.isTextBased()) {
            //     channel.send(midMessageToMidPerson);
            // }

        }, 1000 )
    })
}