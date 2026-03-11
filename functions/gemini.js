const config = require('../config.json');
const system = require('./logsystem.js');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const GeminiAI = new GoogleGenerativeAI(config.gemini);

exports.run = async function (prompt) {
    let text;
    try {
        const model = GeminiAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        text = response.text();
        if (text && text.length > 1000) {
            text = text.substring(0, 1000) + '...';
        }
        await system.log(`Geminiからのレスポンスを受信`, "Gemini-API使用");
    }
    catch (err) {
        try {
            await system.error(`Geminiからのレスポンスを受信できませんでした`, err, "Gemini-API使用");
        } catch (logErr) {
            console.error("Failed to send error to Discord:", logErr);
        }
        return "Geminiによる要約の取得に失敗しました。";
    }
    return text;
}