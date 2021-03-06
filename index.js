/**
 * @description Rad Dream Bot
 * @author Potor10 
 * @summary A Discord Bot For Princess Connect
 */



//const { Client, Attachment, MessageEmbed } = require("discord.js");

const discord = require('discord.js');

const { Player } = require('discord-player');
const fs = require('fs');

const client = new discord.Client({disableMentions: 'everyone'});

client.player = new Player(client);
client.config = require('./config/config');
client.emotes = client.config.emojis;
client.filters = client.config.filters;
client.commands = new discord.Collection();
client.gacha = client.config.gacha;

// Objects Used To Store Realtime Changes - Obtained Once On Startup
client.userData = {};
client.gachaData = {};
client.collectionData = {};
client.isResetGacha = false;

fs.readdirSync('./commands').forEach(dirs => {
    const commands = fs.readdirSync(`./commands/${dirs}`).filter(files => files.endsWith('.js'));

    for (const file of commands) {
        const command = require(`./commands/${dirs}/${file}`);
        console.log(`LOG: Loading command ${file}`);
        client.commands.set(command.name.toLowerCase(), command);
    };
});

const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const player = fs.readdirSync('./player').filter(file => file.endsWith('.js'));

for (const file of events) {
    console.log(`LOG: Loading discord.js event ${file}`);
    const event = require(`./events/${file}`);
    client.on(file.split(".")[0], event.bind(null, client));
};

for (const file of player) {
    console.log(`LOG: Loading discord-player event ${file}`);
    const event = require(`./player/${file}`);
    client.player.on(file.split(".")[0], event.bind(null, client));
};

// Catch the AUTISM
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

let updateAll = require('./database/updateDatabase/updateAll');
process.on("SIGINT", async () => (await updateAll(client), process.exit(0)));
process.on("SIGTERM", async () => (await updateAll(client), process.exit(0)));

//Initialize
let initAll = require('./database/updateObject/initAllObj');
let initGacha = require('./database/updateObject/initGachaObj');
(async () => {
    await initAll(client);
    await initGacha(client);

    let loadImage = require('./helper/gacha/loadImage');
    client.amuletSRC = await loadImage(
        `https://media.discordapp.net/emojis/811495998450565140.png?width=${client.gacha.sizOverlay}&height=${client.gacha.sizOverlay}`);

    client.gachaBG = await loadImage(`./img/gachabg.png`);

    // Log In
    console.log("LOG: Logging In To Princonne Bot");
    client.login(process.env["BOT_TOKEN"]);
})();


