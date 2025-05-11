import fetch from 'node-fetch';
import { AttachmentBuilder } from 'discord.js';

async function getCafeenHtml() {
    const response = await fetch("https://www.cafeen.org/test.php?");
    return await response.blob();
}

async function getByteArray() {
    const html = await getCafeenHtml(); 
    const arrayBuffer = await html.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
}

export default async function cafeen(interaction) {
    try {
        await interaction.deferReply();
        const bytesArr = await getByteArray();
        const attachment = new AttachmentBuilder(bytesArr, { name: 'image.png' });
        await interaction.editReply({ 
            content: "🍺 - Direkte fra cafeen", 
            files: [attachment],
        });
    } catch (err) {
        console.log(err);
        await interaction.editReply({ content: "tester" });
    }
} 