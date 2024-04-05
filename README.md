# KosenRBKN-notice-bot
高専ロボコン公式HPが更新されるとお知らせするbotです

## 使い方
[招待リンク](https://discord.com/oauth2/authorize?client_id=1225690618123124736&permissions=2147506176&scope=bot)よりサーバーに導入し、/add-channelでお知らせを送信するチャンネルを登録してください  
詳しい説明は、/adimin-helpや/helpで確認できます

## メモ
config.json
```json
{
  "token": "YOUR_BOT_TOKEN",
  "logSystem": "LOG_CHANNEL_ID",
  "errorSystem": "ERRORLOG_CHANNEL_ID",
  "client": "YOUR_BOT_ID",
  "db": "DATABASE_URL"
}
```
