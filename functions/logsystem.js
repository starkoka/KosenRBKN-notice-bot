const {EmbedBuilder} = require("discord.js");
const config = require("../config.json");

/***
 * ログをコンソールとdiscordに送信する
 * @param message ログの本文
 * @param title ログのタイトル。省略可
 */
exports.log = async function func(message,title) {
    const date = new Date().toLocaleString(); // YYYY/MM/DD hh:mm:ss形式に変換
    console.log(`${title ?? "システムログ"} ----\n${(message.trim().split("```").join(''))}\n--------${date}\n`);
    const embed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle(title ?? "システムログ")
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Discord Log System' });

    const channel = await client.channels.fetch(config.logSystem);
    await channel.send({embeds: [embed]});
}

/***
 * エラー通知とログをコンソールとdiscordに送信する
 * @param message エラーメッセージの本文
 * @param error エラーオブジェクト。error.stackが存在する場合にそれが送られる。省略可
 * @param title エラーメッセージのタイトル。省略可
 */
exports.error = async function func(message,error= {stack:""},title="エラー") {
    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(title)
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Discord Log System' });
    const date = new Date().toLocaleString(); // YYYY/MM/DD hh:mm:ss形式に変換
    console.error(`${title} ----\n${(message.trim().split("```").join(''))}\n\n${error.stack}\n\n--------${date}\n`);

    const errorChannel = await client.channels.fetch(config.errorSystem);
    await errorChannel.send({embeds: [embed]});
    await errorChannel.send(`\`\`\`\n${error.stack}\n\`\`\``);

    const logChannel = await client.channels.fetch(config.logSystem);
    await logChannel.send({embeds: [embed]});
    await logChannel.send(`\`\`\`\n${error.stack}\n\`\`\``);


}

/***
 * 警告をdiscordに送信する
 * @param message ログの本文
 * @param title ログのタイトル。省略可
 */
exports.warn = async function func(message,title="警告") {
    const date = new Date().toLocaleString(); // YYYY/MM/DD hh:mm:ss形式に変換
    console.warn(`${title} ----\n${(message.trim().split("```").join(''))}\n--------${date}\n`);
    const embed = new EmbedBuilder()
        .setColor(0xEC9F38)
        .setTitle(title)
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Discord Log System' });

    const logChannel = await client.channels.fetch(config.logSystem);
    const errorChannel = await client.channels.fetch(config.errorSystem);

    await logChannel.send({embeds: [embed]});
    await errorChannel.send({embeds: [embed]});
}

