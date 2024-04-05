const { SlashCommandBuilder, EmbedBuilder , version} = require('discord.js');
const db = require('../functions/db.js');
const help = require("../functions/help.js");
const packageVer = require('../package.json');

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('このBOTのpingを測定します'),
        async execute(interaction) {
            await interaction.reply( `Ping : ${interaction.client.ws.ping}ms` );
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('last-updata')
            .setDescription('最後に更新された時刻を確認します'),
        async execute(interaction) {
            await interaction.deferReply();
            const data = await db.find("main","data",{dataType:"before"});

            if(data.length === 0){
                const embed = new EmbedBuilder()
                    .setColor(0x43B07C)
                    .setTitle('HP最終更新日')
                    .setAuthor({
                        name: "[非公式]高専ロボコンHP更新お知らせbot",
                        iconURL: 'https://cdn.discordapp.com/avatars/1225690618123124736/539e20d2d9e586443173f358989c81b4.webp',
                        url: 'https://github.com/starkoka/KosenRBKN-notice-bot'
                    })
                    .setDescription('このBOTが記録した更新はまだありません。')
                    .setTimestamp()
                    .setFooter({ text: 'Developed by kokastar' });
                await interaction.editReply({ embeds: [embed] });
            }
            else{
                const embed = new EmbedBuilder()
                    .setColor(0x43B07C)
                    .setTitle('HP最終更新日')
                    .setAuthor({
                        name: "[非公式]高専ロボコンHP更新お知らせbot",
                        iconURL: 'https://cdn.discordapp.com/avatars/1225690618123124736/539e20d2d9e586443173f358989c81b4.webp',
                        url: 'https://github.com/starkoka/KosenRBKN-notice-bot'
                    })
                    .setDescription(`最終更新:${data[0].date}`)
                    .setTimestamp()
                    .setFooter({ text: 'Developed by kokastar' });
                await interaction.editReply({ embeds: [embed] });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('add-channel')
            .setDMPermission(false)
            .setDefaultMemberPermissions(1<<3)
            .setDescription('実行したチャンネルを、HP更新通知を受け取るチャンネルに追加します'),
        async execute(interaction) {
            await interaction.deferReply({ephemeral: true});
            await db.updateOrInsert("main","channels",{channelId:interaction.channelId},{
                channelId:interaction.channelId
            });
            await interaction.editReply("追加しました");
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('del-channel')
            .setDMPermission(false)
            .setDefaultMemberPermissions(1<<3)
            .setDescription('実行したチャンネルを、HP更新通知を受け取るチャンネルから除外します'),
        async execute(interaction) {
            await interaction.deferReply({ephemeral: true});
            await db.delete("main","channels",{channelId:interaction.channelId});
            await interaction.editReply("削除しました");
        },
    },

    {
        data: new SlashCommandBuilder()
            .setName('send-to-dm')
            .setDescription('DMで更新通知を受け取るかどうかを設定します')
            .addBooleanOption(option =>
                option
                    .setName('option')
                    .setDescription('True or False')
                    .setRequired(true)
            ),
        async execute(interaction) {
            await interaction.deferReply({ephemeral: true});
            if(interaction.options.getBoolean('option')){
                await db.updateOrInsert("main","users",{userId:interaction.user.id},{
                    userId:interaction.user.id
                });
                await interaction.editReply("登録しました");
            }
            else{
                await db.delete("main","users",{userId:interaction.user.id});
                await interaction.editReply("解除しました");
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('help')
            .setDescription('このBOTのヘルプを表示します'),
        async execute(interaction) {
            await help.helpSend(interaction);
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('admin-help')
            .setDescription('管理者向けメニューをDMで表示します。')
            .setDefaultMemberPermissions(1<<3)
            .setDMPermission(false),
        async execute(interaction) {
            await interaction.reply({ content: "DMに管理者向けメニューを送信しました。受信できていない場合、以下に該当していないかどうかご確認ください。\n・このサーバー上の他のメンバーからのDMをOFFにしている\n・フレンドからのDMのみを許可している\n・このBOTをブロックしている", ephemeral: true });
            await help.adminHelpSend(interaction.user);
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('about')
            .setDescription('このBOTの概要を表示します'),
        async execute(interaction) {
            const embed = new EmbedBuilder()
                .setColor(0x43B07C)
                .setTitle('高専ロボコンHP更新お知らせbot概要')
                .setAuthor({
                    name: "[非公式]高専ロボコンHP更新お知らせbot",
                    iconURL: 'https://cdn.discordapp.com/avatars/1225690618123124736/539e20d2d9e586443173f358989c81b4.webp',
                    url: 'https://github.com/starkoka/KosenRBKN-notice-bot'
                })
                .setDescription('このbotの概要を紹介します')
                .addFields(
                    [
                        {
                            name: 'バージョン情報',
                            value: 'v' + packageVer.version,
                        },
                        {
                            name: '開発者',
                            value: '[kokastar](https://github.com/starkoka)が開発・運用しています。',
                        },
                        {
                            name:"ソースコード",
                            value:"このBOTは、オープンソースとなっています。[GitHub](https://github.com/starkoka/KosenRBKN-notice-bot)にて公開されています。\n"
                        },
                        {
                            name:"バグの報告先",
                            value:"[Issue](https://github.com/starkoka/KosenRBKN-notice-bot/issues)までお願いします。\nサポート等の詳細は/helpや/admin-helpを実行してください。\n"
                        },
                        {
                            name: '実行環境',
                            value: 'node.js v' + process.versions.node + `\n discord.js v` + version + `\n MongoDB 6.0 Powered by AWS`,

                        },
                    ]
                )
                .setTimestamp()
                .setFooter({ text: 'Developed by kokastar' });
            await interaction.reply({ embeds: [embed] });
        },
    },
]