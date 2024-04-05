# KosenRBKN-notice-bot
高専ロボコン公式HPが更新されるとお知らせするbotです

## 使い方
### 自分のサーバーで運用する場合
index.jsと同じ階層に、以下のconfig.jsonを作成してください。
```json
{
  "token": "YOUR_BOT_TOKEN",
  "logSystem": "LOG_CHANNEL_ID",
  "errorSystem": "ERRORLOG_CHANNEL_ID",
  "client": "YOUR_BOT_ID"
}
```
その後、deploy-commands.jsを実行してスラッシュコマンドを登録した後、index.jsを実行してください。
