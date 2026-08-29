// sample code
let calendars = document.querySelectorAll(".list-rst__calendar-frame");
for(let i = 0; i < calendars.length; i++){
  let e = calendars[i];
  e.style.display = 'none';
}

// Youtubeにアクセスしたら、各ボタンを準備
// buttonを5つ(スクショ撮影用/次フレーム/前フレーム/1sec後/1sec前)生成して、最後に追加

// buttonを生成 (スクショ撮影)
let shoot = document.createElement('button');
shoot.id = 'shoot';
shoot.textContent = 'take a screenshot';

// ボタン押下でスクショ撮影
shoot.addEventListener('click', () => {
  let video = document.querySelector('video');
  if (!video) return;

  // canvasを生成して描画
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  let dataURL = canvas.toDataURL('image/png');

  // ファイル名称 (動画タイトル)
  let titleElement = document.querySelector('h1.ytd-watch-metadata');
  let fileName = titleElement ? titleElement.textContent.trim().replace(/[/\\?%*:|"<>]/g,'_') : 'yt_ss';

  // ダウンロード
  chrome.runtime.sendMessage({
    action: 'download',
    url: dataURL,
    fileName: fileName
  });
});



let nextFr = document.createElement('button'); // 1フレ先へ
nextFr.id = 'nextFr';
let prevFr = document.createElement('button'); // 1フレ前へ
prevFr.id = 'prevFr';
let nextSec = document.createElement('button'); // 1sec先へ
nextSec.id = 'nextSec';
let prevSec = document.createElement('button'); // 1sec前へ
prevSec.id = 'prevSec';

// 各ボタンをタイトルの右側の余白に追加
let targetArea = document.querySelector('ytd-watch-metadata');
if (targetArea) {
  targetArea.appendChild(shoot);
};