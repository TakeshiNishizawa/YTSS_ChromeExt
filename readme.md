# YouTube用Chrome拡張機能

## 1. 機能ごとの実装難易度と仕組み

### 1秒 / 1フレーム移動（難易度：低）
* Content Script（ページ内で動くJavaScript）を用いてYouTubeの `<video>` 要素を取得します。
* `video.currentTime += 1` または `-= 1` で1秒移動できます。
* 1フレーム移動は、一般的な30fps（約0.033秒）や60fps（約0.0166秒）を `currentTime` に加減算し、一時停止状態（`video.pause()`）で操作することで正確に機能します。

### スクリーンショット撮影（難易度：低〜中）
* JavaScriptの `<canvas>` 要素を作成し、`ctx.drawImage(video, 0, 0, width, height)` で動画フレームを描画します。
* canvasを `toDataURL('image/png')` や `toBlob()` で画像データ化します。

### UIボタンの挿入（難易度：低）
* YouTubeのプレイヤーコントロールバー（`.ytp-left-controls` 等のクラス）をDOM操作で取得し、`appendChild` で独自のボタン要素を追加します。

---

## 2. フォルダ保存と設定画面の実現方法

Chrome拡張機能のセキュリティ制限上、PC内の「任意の絶対パス（例：`D:\MyVideo\`）」へ直接アクセスすることはできませんが、以下の2つの方法でスマートに解決できます。

### 推奨：`chrome.downloads` API を利用する（最も簡単）
* 標準のダウンロード機能を呼び出し、保存先を「標準のダウンロードフォルダ＋サブフォルダ指定（例：`Downloads/YouTube_Screenshots/`）」にする方法です。
* `chrome.downloads.download({ url: dataUrl, filename: 'YouTube_Screenshots/ss.png' })` と記述するだけで保存できます。

### 任意フォルダ指定：`File System Access API` を使う
* 設定画面（Options Page）を作成し、`window.showDirectoryPicker()` でユーザーが任意の保存先フォルダを選択・許可を付与することで、指定フォルダへ直接ファイルを書き出すことも可能です。

---

## 3. セキュリティの懸念とプライバシー**

### 自分専用運用の安全度
* 外部サーバーと通信を行わず、ローカル（ブラウザ内）だけで処理を完結させる設計にすれば、情報漏洩などのセキュリティリスクは**ほぼゼロ**です。

### 権限（Permissions）の最適化
* `manifest.json` に記述する権限は `downloads` と host_permissions の `[https://www.youtube.com/](https://www.youtube.com/)*` だけに絞ることで、安全で堅牢な拡張機能になります。

---

## 4. 他ユーザーへの公開・非公開（配布方法）

### ストア公開は不要（完全無料・完全非公開）
* Chrome Web Storeに公開する必要はなく、アカウント登録（5ドルの初回手数料）も不要です。

### ローカルでの読み込み手順
1. ChromeのURLバーに `chrome://extensions` と入力して開く。
2. 右上の「デベロッパー モード」をONにする。
3. 「パッケージ化されていない拡張機能を読み込む（Load unpacked）」をクリックし、作成したプログラムのフォルダを選択する。

これだけで、自分だけの拡張機能として即座に動作します。
