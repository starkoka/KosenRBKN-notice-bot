const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

async function sendToChannel(channelId, payloads, label) {
    try {
        const channel = await client.channels.fetch(channelId);

        for (const payload of payloads) {
            await channel.send(payload);
        }
    } catch (sendErr) {
        console.error(`Discordへのログ送信に失敗しました (${label}):`, sendErr);
    }
}

/***
 * ログをコンソールとdiscordに送信する
 * @param message ログの本文
 * @param title ログのタイトル。省略可
 */
exports.log = async function func(message, title) {
    const date = new Date().toLocaleString(); // YYYY/MM/DD hh:mm:ss形式に変換
    console.log(`${title ?? "システムログ"} ----\n${(message.trim().split("```").join(''))}\n--------${date}\n`);
    const embed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle(title ?? "システムログ")
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Discord Log System' });

    await sendToChannel(
        config.logSystem,
        [{ embeds: [embed] }],
        "logSystem"
    );
}

/***
 * エラー通知とログをコンソールとdiscordに送信する
 * @param message エラーメッセージの本文
 * @param error エラーオブジェクト。error.stackが存在する場合にそれが送られる。省略可
 * @param title エラーメッセージのタイトル。省略可
 */
exports.error = async function func(message, error = { stack: "" }, title = "エラー") {
    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(title)
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Discord Log System' });
    const date = new Date().toLocaleString(); // YYYY/MM/DD hh:mm:ss形式に変換
    console.error(`${title} ----\n${(message.trim().split("```").join(''))}\n\n${error.stack}\n\n--------${date}\n`);

    let errorStack = error && error.stack ? String(error.stack) : String(error);
    if (errorStack.length > 1900) {
        errorStack = errorStack.substring(0, 1900) + "...\n(truncated)";
    }

    await Promise.allSettled([
        sendToChannel(
            config.errorSystem,
            [
                { embeds: [embed] },
                `\`\`\`\n${errorStack}\n\`\`\``
            ],
            "errorSystem"
        ),
        sendToChannel(
            config.logSystem,
            [
                { embeds: [embed] },
                `\`\`\`\n${errorStack}\n\`\`\``
            ],
            "logSystem"
        )
    ]);
}

/***
 * 警告をdiscordに送信する
 * @param message ログの本文
 * @param title ログのタイトル。省略可
 */
exports.warn = async function func(message, title = "警告") {
    const date = new Date().toLocaleString(); // YYYY/MM/DD hh:mm:ss形式に変換
    console.warn(`${title} ----\n${(message.trim().split("```").join(''))}\n--------${date}\n`);
    const embed = new EmbedBuilder()
        .setColor(0xEC9F38)
        .setTitle(title)
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Discord Log System' });

    await Promise.allSettled([
        sendToChannel(
            config.logSystem,
            [{ embeds: [embed] }],
            "logSystem"
        ),
        sendToChannel(
            config.errorSystem,
            [{ embeds: [embed] }],
            "errorSystem"
        )
    ]);
}
