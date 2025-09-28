import { chromium } from 'playwright'; // require ではなく import
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: false });

  const downloadDir = '/mnt/e/Downloads/'; // 置きたいフォルダに変更
  fs.mkdirSync(downloadDir, { recursive: true });
  
  // 日本語ロケールでコンテキストを作成
  const context = await browser.newContext({
    acceptDownloads: true,
    downloadsPath: downloadDir,
    locale: 'ja-JP'
  });
  const page = await context.newPage();

  const roles = ["mid", "top", "jg", "sup", "bot"];

  for (const role of roles) {
    const reasonJsonPath = `http://localhost:5173/lol-matchup-quiz/lol-matchup-quiz/ja/${role}_reason.json`;
    console.log('reasonJsonPath:', reasonJsonPath);

    const reasonResponse = await fetch(reasonJsonPath);
    if (!reasonResponse.ok) {
      alert("データが見つかりません");
      return;
    }
    const reasonJsonData = await reasonResponse.json();

    const opponents = Object.keys(reasonJsonData);

    await page.goto('http://localhost:5173/');

    // 少し待機（UI更新のため）
    await page.waitForTimeout(1000);

    // セレクトが出るまで待つ
    await page.waitForSelector('.translate-select');

    // ラベルが「日本語」の option を選ぶ
    await page.selectOption('.translate-select', { label: '日本語' });

    // explainボタンをクリック
    await page.click('#explain-button');
    await page.waitForTimeout(100);

    for (const opponent of opponents) {
      let myChamps = Object.keys(reasonJsonData[opponent]['beats']);
      myChamps = myChamps.concat(Object.keys(reasonJsonData[opponent]['loses']));
      for (const myChamp of myChamps) {
        console.log(role, opponent, myChamp);

        // ファイル存在確認
        const checkPath = path.join(downloadDir, `explanation_${role}_${opponent}_vs_${myChamp}.html`);
        if (fs.existsSync(checkPath)) {
          console.log("Skip (already exists):", checkPath);
          continue; // ダウンロード処理をスキップ
        }

        // 以下繰り返し
        await page.getByLabel('Role:').fill(role);
        await page.getByLabel('Champion 1:').fill(opponent);
        await page.getByLabel('Champion 2:').fill(myChamp);
        
        await page.waitForSelector('button.update-explain');
        await     page.click('button.update-explain');
        await page.waitForTimeout(1000);
        let downloadPromise = page.waitForEvent('download'); // ダウンロード発生を待つ
        await     page.click('button.update-explain');
        let download = await downloadPromise;

        // 推奨ファイル名を取得して保存先を作る
        const suggested = download.suggestedFilename(); // サーバが送った名前
        const savePath = path.join(downloadDir, `${suggested}`);

        await download.saveAs(savePath); // 任意のパスで保存
        console.log('Saved to', savePath);

        await page.waitForTimeout(500);
      }
    }
  }
  
  await page.screenshot({ path: 'screenshot.png' });

  await browser.close();
})();
