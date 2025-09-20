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

  await page.goto('http://localhost:5173/');

  // 少し待機（UI更新のため）
  await page.waitForTimeout(1000);

  // セレクトが出るまで待つ
  await page.waitForSelector('.translate-select');

  // ラベルが「日本語」の option を選ぶ
  await page.selectOption('.translate-select', { label: '日本語' });

  // 例: ボタンをクリック
  await page.click('button.next-button');
  await page.click('button.role-btn.sup');
  await page.click('//*[@id="root"]/div/div/div[2]/div[2]/button');

   // champion-button のリストを取得
  let buttons = await page.$$('.champion-button'); // $$ で複数要素を取得

  console.log(`見つかったボタン数: ${buttons.length}`);

  // for文で順番にクリック
  let i = 0
  while (i < buttons.length) {
    buttons = await page.$$('.champion-button'); // $$ で複数要素を取得
    console.log(`クリック: ${i + 1}番目`);
    await buttons[i].click();
    
    // startButton が出るのを待つ
    await page.waitForSelector('.startButton', { timeout: 5000 });

    // startButton をクリック
    await page.click('.startButton');

    // 少し待機（UI更新のため）
    await page.waitForTimeout(1000);

    while (true) {
        // champion のリストを取得
        const champs = await page.$$('.champion');

        if (champs.length >= 2) {
            const [download] = await Promise.all([
                page.waitForEvent('download'), // ダウンロード発生を待つ
                champs[1].click() // 2個目をクリック
            ]);
            console.log(`champion の2個目をクリックしました`);

            // 推奨ファイル名を取得して保存先を作る
            const suggested = download.suggestedFilename(); // サーバが送った名前
            const savePath = path.join(downloadDir, `${suggested}`);

            await download.saveAs(savePath); // 任意のパスで保存
            console.log('Saved to', savePath);

        } else {
            console.log(`champion が2個以上見つかりませんでした`);
            break; // ループを抜ける
        }

        await page.waitForTimeout(2000); // 0.5秒待つ（挙動確認用）
        await page.click('button#next-button');
        await page.waitForTimeout(500); // 0.5秒待つ（挙動確認用）
        
    }

    // 「再挑戦」というテキストのボタンをクリック
    await page.getByText('再挑戦').click();
    console.log(`「再挑戦」ボタンをクリックしました`);
    
    await page.waitForTimeout(500); // 0.5秒待つ（挙動確認用）

    i++;
  }
  

  // 例: テキスト入力
  // await page.fill('input[name="username"]', 'testuser');

  await page.screenshot({ path: 'screenshot.png' });

  await browser.close();
})();
