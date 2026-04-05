// 1. config.json から設定を読み込む（同じ階層にある前提）
const config = require('./config.json');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// config.json の中身 (config.gemini) をAPIキーとして使用
const GeminiAI = new GoogleGenerativeAI(config.gemini);

// ==========================================
// 2. テスト対象のプログラム部分
// ==========================================
async function runGemini(prompt) {
    let text;
    try {
        const model = GeminiAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview"});
        const result = await model.generateContent(prompt);
        const response = result.response;
        text = response.text();
        console.log(`[Gemini-API使用] Geminiからのレスポンスを受信しました。`);
    } catch(err) {
        console.error(`[Gemini-API使用] Geminiからのレスポンスを受信できませんでした\n`, err);
        return "Geminiからのレスポンスを受信できませんでした。";
    }
    return text;
}

// ==========================================
// 3. 動作確認（テスト）実行部分
// ==========================================
async function runTest() {
    console.log("=== テスト開始 ===");

    const testPrompt = "こんにちは！短い挨拶をお願いします。";
    console.log(`送信プロンプト: "${testPrompt}"\n`);

    // 対象プログラムの呼び出し
    const result = await runGemini(testPrompt);

    console.log("\n=== 実行結果 ===");
    console.log(result);
    console.log("\n=== テスト終了 ===");
}

// テストを実行
runTest();