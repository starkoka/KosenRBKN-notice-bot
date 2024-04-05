const { SlashCommandBuilder, EmbedBuilder , version} = require('discord.js');
const db = require('../functions/db.js');

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
                    .setColor(0x00A0EA)
                    .setTitle('HP更新確認')
                    .setAuthor({
                        name: "高専ロボコンHP更新お知らせbot",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
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
            const text = yesterdayData[0].value === todayData[0].value ? "HPは更新されていません。" : "HPが更新されています。";

            const embed = new EmbedBuilder()
                .setColor(0x00A0EA)
                .setTitle('HP更新確認')
                .setAuthor({
                    name: "高専ロボコンHP更新お知らせbot",
                    iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
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
            .setDescription('実行したチャンネルを、HP更新通知を受け取るチャンネルから除外します'),
        async execute(interaction) {
            await interaction.deferReply({ephemeral: true});
            await db.delete("main","channels",{channelId:interaction.channelId});
            await interaction.editReply("削除しました");
        },
    },
]