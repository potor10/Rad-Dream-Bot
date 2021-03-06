module.exports = async (client, message, values, rectangles) => {
    const { MessageEmbed } = require("discord.js");
    
    const intAttacks = [];

    for (let i = 2; i < rectangles.length; i++) {
        if (i < values.length) {
            let intString = values[i].split('\n', 1)[0].replace(/\D/g,'');
            let parsedDamage = parseInt(intString, 10);
            if (isNaN(parsedDamage)) {
                let reminder = await message.reply(`error parsing damage values, try using a higher image resolution next time!`);
                console.log(`LOG: Values: ${values[i]} failed to parse`);
                setTimeout(() => { reminder.delete();}, 5000);
                return;
            }
            intAttacks.unshift(parsedDamage);

        } else {
            intAttacks.push(0);
        }
    }
    
    const pad = (num) => { 
        return ('00'+num).slice(-2) 
    };
    
    let date;
    const let3Month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let idxDate = -1;

    for (let i = 0; i < let3Month.length; i++) {
        if (values[1].indexOf(let3Month[i]) != -1) {
            idxDate = values[1].indexOf(let3Month[i]);
            break;
        }
    }

    if (idxDate != -1) {
        let dateStr = values[1].substr(idxDate, 6);
        while (dateStr.length > 0 && isNaN(Date.parse(`${dateStr} ${new Date().getUTCFullYear()}`))) {
            dateStr = dateStr.slice(0, -1);
        }
        date = Date.parse(`${dateStr} ${new Date().getUTCFullYear()}`);
        console.log(`LOG: Date Parsed, Found ${date} from ${dateStr} ${new Date().getUTCFullYear()}`);
        
        let newdate = new Date(date);

        if (isNaN(newdate.getTime())) {  
            let reminder = await message.reply(`Error: Invalid Date!`);
            setTimeout(() => { reminder.delete();}, 5000);
            return;
        } 

        let getClanBattleId = require('../clanbattle/getClanBattleId');
        let attackCBid = getClanBattleId(newdate);

        if (attackCBid == -1) {
            let reminder = await message.reply(`${newdate.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}` +
                ` is out of range of the Clan Battle period`);
            setTimeout(() => { reminder.delete();}, 5000);
            return;
        }

        newdate = newdate.getUTCFullYear() + '-' + pad(newdate.getUTCMonth() + 1)  + '-' + pad(newdate.getUTCDate());

        let updateAttack = require('../../database/updateDatabase/updateAttack');
        await updateAttack(message.author.id, newdate, intAttacks[0], intAttacks[1], intAttacks[2], attackCBid);

        await message.channel.send(new MessageEmbed()
        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setTitle(`${message.author.displayName||message.author.username}'s attack`)
        .setDescription(`On ` + 
            `${new Date(date).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})} ` +
            `: Clan Battle #${attackCBid}`)
        .addFields(
            { name: `Attempt 1 ${client.emotes.swordSmallAttackEmoji}`, value: intAttacks[0], inline: true },
            { name: `Attempt 2 ${client.emotes.swordSmallAttackEmoji}`, value: intAttacks[1], inline: true },
            { name: `Attempt 3 ${client.emotes.swordSmallAttackEmoji}`, value: intAttacks[2], inline: true },
        )
        .addField(`Total Damage Dealt For This Day ${client.emotes.swordBigAttackEmoji}`, intAttacks[0] + intAttacks[1] + intAttacks[2])
        .setFooter(client.config.discord.footerText, client.user.avatarURL())
        .setTimestamp());
    }
}
