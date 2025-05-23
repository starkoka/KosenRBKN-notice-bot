import {Client, GatewayIntentBits, Partials, Collection, Events, EmbedBuilder} from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cron from 'node-cron';
global.client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel],
});

//configファイル読み込み

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, './config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

//関数読み込み
import system from './functions/logsystem.js';
import {fetchWebsite} from './functions/scraping.mjs';
import db, {find,updateOrInsert} from './functions/db.js';
import {adminHelpDisplay,helpDisplay} from "./functions/help.js";
import gemini from './functions/gemini.js';

//スラッシュコマンド登録
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();
//module.exports = client.commands;
client.once("ready", async() => {
    for(const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = (await import(filePath)).default;
        for(let i = 0; i < command.length; i++) {
            client.commands.set(command[i].data.name, command[i]);
        }
    }
    await system.log("Ready!");
});


/*command処理*/
client.on("interactionCreate", async(interaction) => {

    if (!interaction.isCommand()) {
        return;
    }
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;
    let guild,channel;
    if(!interaction.guildId) {
        guild = {name:"ダイレクトメッセージ",id:"---"};
        channel = {name:"---",id:"---"};
    }
    else{
        guild = client.guilds.cache.get(interaction.guildId) ?? await client.guilds.fetch(interaction.guildId);
        channel = client.channels.cache.get(interaction.channelId) ?? await client.channels.fetch(interaction.channelId);
    }
    await system.log(`コマンド名:${command.data.name}\`\`\`\nギルド　　：${guild.name}\n(ID:${guild.id})\n\nチャンネル：${channel.name}\n(ID:${channel.id})\n\nユーザ　　：${interaction.user.username}#${interaction.user.discriminator}\n(ID:${interaction.user.id})\`\`\``, "SlashCommand");
    try {
        await command.execute(interaction);
    }
    catch(error) {
        await system.error(`スラッシュコマンド実行時エラー : ${command.data.name}\n\`\`\`\nギルド　　：${guild.name}\n(ID:${guild.id})\n\nチャンネル：${channel.name}\n(ID:${channel.id})\n\nユーザ　　：${interaction.user.username}#${interaction.user.discriminator}\n(ID:${interaction.user.id})\`\`\``, error);
        try {
            await interaction.reply({content: 'おっと、想定外の事態が起きちゃった。[Issue](https://github.com/NITKC-DEV/Kisarazu-Multi-Manager/issues)に連絡してくれ。', ephemeral: true});
        }
        catch {
            try{
                await interaction.editReply({
                    content: 'おっと、想定外の事態が起きちゃった。[Issue](https://github.com/NITKC-DEV/Kisarazu-Multi-Manager/issues)に連絡してくれ。',
                    ephemeral: true
                });
            }
            catch{} //edit先が消えてる可能性を考えてtryに入れる
        }
    }
});

//現在データを取得
cron.schedule('* * * * *', async () => {
    try{
        const checkWebsite = await fetchWebsite();
        if(checkWebsite.isUpdate) {
            const discriptionByGemini = await gemini.run(`以下にWebサイトのDiffを示すので、変更点を50文字程度で箇条書きで要約してください。余計な文章は入れないことと、適切に改行すること\n\n${checkWebsite.diff}\n\n要約:`);

            const embed = new EmbedBuilder()
                .setColor(0x43B07C)
                .setTitle('HP更新確認')
                .setAuthor({
                    name: "[非公式]高専ロボコンHP更新お知らせbot",
                    iconURL: 'https://cdn.discordapp.com/avatars/1225690618123124736/539e20d2d9e586443173f358989c81b4.webp',
                    url: 'https://github.com/starkoka/KosenRBKN-notice-bot'
                })
                .setDescription(`[公式HP](https://official-robocon.com/kosen/)が更新されています。\n\n更新の差分は[こちら](https://kokastar.dev/kosenRBKN-HPDiff.html)から確認できます。`)
                .addFields(
                    [
                        {
                            name: '更新概要',
                            value: "```" + discriptionByGemini + "\n```",
                        }
                    ]
                )
                .setTimestamp()
                .setFooter({ text: 'Developed by kokastar' });


            const channels = await find("main","channels",{});
            for(const channel of channels){
                try{
                    await (client.channels.cache.get(channel.channelId) ?? await client.channels.fetch(channel.channelId)).send({embeds:[embed]})
                }
                catch{}
            }

            const users = await find("main","users",{});
            for(const user of users){
                try{
                    await (client.users.cache.get(user.userId) ?? await client.users.fetch(user.userId)).send({embeds:[embed]});
                }
                catch{}
            }
        }
    }
    catch{}
});

//ステータス更新
cron.schedule('* * * * *', async () => {
    const date = new Date();
    const time = Math.floor(date.getTime() / 1000 / 60)%4
    switch(time){
        case 1:
            client.user.setPresence({
                activities: [{
                    name: `ヘルプ:/help`
                }],
            });
            break;
        case 2:
            client.user.setPresence({
                activities: [{
                    name: `管理者ヘルプ:/admin-help`
                }],
            });
            break;
        case 3:
            client.user.setPresence({
                activities: [{
                    name: `概要:/about`
                }],
            });
            break;
        default:
            client.user.setPresence({
                activities: [{
                    name: `導入数：${client.guilds.cache.size}サーバー`
                }],
            });
    }
});

//StringSelectMenu受け取り
client.on(Events.InteractionCreate, async interaction => {
    if(interaction.isStringSelectMenu()) {
        if (interaction.customId === "adminHelp"){
            await adminHelpDisplay(interaction);
        }
        else if (interaction.customId === "help"){
            await helpDisplay(interaction);
        }
    }
});


client.login(config.token);