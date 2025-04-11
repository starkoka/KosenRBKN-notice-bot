const config = require('../config.json');
const system = require('./logsystem.js');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const GeminiAI = new GoogleGenerativeAI(config.gemini);

exports.run = async function (prompt) {
    let text;
    try{
        const model = GeminiAI.getGenerativeModel({ model: "gemini-2.0-flash"});
        const result = await model.generateContent(prompt);
        const response = result.response;
        text = response.text();
        await system.log(`Geminiからのレスポンスを受信`, "Gemini-API使用");
    }
    catch(err){
        await system.error(`Geminiからのレスポンスを受信できませんでした`, err, "Gemini-API使用");
        return null;
    }
    return text;
}