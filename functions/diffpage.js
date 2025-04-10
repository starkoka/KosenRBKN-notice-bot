import { readFile } from "fs/promises"
const config =  JSON.parse(await readFile("./config.json"))
import { createTwoFilesPatch } from 'diff';
import fs from 'fs';

/***
 * Diffチェッカーを生成する
 * @param before 更新前のデータ
 * @param after 更新後のデータ
 */
export async function generate(before, after) {
    const diffStr = createTwoFilesPatch("https://official-robocon.com/kosen/", "https://official-robocon.com/kosen/", before, after);

    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Diff2Html UI Output</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css" />
          <style>
            body { font-family: sans-serif; margin: 20px; }
            #diff-container { margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2>高専ロボコン公式HP 差分チェッカー </h2>
          <p>[非公式]高専ロボコンHP更新お知らせbot により生成されています。</p>
          <a>ソースコードや招待リンクは</a>
          <a href="https://github.com/starkoka/KosenRBKN-notice-bot">こちら</a>
          <a>から確認できます</a>
        
          <div id="diff-container"></div>
          
         
          <script src="https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui.min.js"></script>
          <script>
            const diffString = \`${diffStr.replace(/`/g, '\\`')}\`;
        
            const targetElement = document.getElementById("diff-container");
            const diff2htmlUi = new Diff2HtmlUI(targetElement, diffString, {
              outputFormat: 'side-by-side',
              drawFileList: true,
              matching: 'lines'
            });
            diff2htmlUi.draw();
            diff2htmlUi.highlightCode();
          </script>
        </body>
        </html>
        `;
    fs.writeFileSync(config.diff, htmlTemplate);
}