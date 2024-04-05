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
            .setName('check')
            .setDescription('昨日19時~現在までの間にHPが更新されたかどうかを確認します'),
        async execute(interaction) {
            await interaction.deferReply();
            const yesterdayData = await db.find("main","data",{dataType:"yesterday"});
            const todayData = await db.find("main","data",{dataType:"today"});

            if(yesterdayData.length === 0 || todayData.length === 0){
                const embed = new EmbedBuilder()
                    .setColor(0x43B07C)
                    .setTitle('HP更新確認')
                    .setAuthor({
                        name: "[非公式]高専ロボコンHP更新お知らせbot",
                        iconURL: 'https://cdn.discordapp.com/avatars/1225690618123124736/539e20d2d9e586443173f358989c81b4.webp',
                        url: 'https://github.com/starkoka/KosenRBKN-notice-bot'
                    })
                    .setDescription('データが不足しています。\n1日立っても治らない場合は、[issue](https://github.com/starkoka/KosenRBKN-notice-bot/issues)への報告をお願いします。')
                    .setTimestamp()
                    .setFooter({ text: 'Developed by kokastar' });
                await interaction.editReply({ embeds: [embed] });
                return ;
            }

            const lastUpdateData = await db.find("main","data",{dataType:"lastUpdateDate"});
            const lastUpdata = lastUpdateData.length === 0 ? "" : `\n\nHP最終更新日時 : ${lastUpdateData[0].value}`;
            const text = yesterdayData[0].value === todayData[0].value ? "公式HPは更新されていません。" : "[公式HP](https://official-robocon.com/kosen/)が更新されています。";

            const embed = new EmbedBuilder()
                .setColor(0x43B07C)
                .setTitle('HP更新確認')
                .setAuthor({
                    name: "[非公式]高専ロボコンHP更新お知らせbot",
                    iconURL: 'https://cdn.discordapp.com/avatars/1225690618123124736/539e20d2d9e586443173f358989c81b4.webp',
                    url: 'https://github.com/starkoka/KosenRBKN-notice-bot'
                })
                .setDescription(`${text}${lastUpdata}`)
                .setTimestamp()
                .setFooter({ text: 'Developed by kokastar' });
            await interaction.editReply({ embeds: [embed] });
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