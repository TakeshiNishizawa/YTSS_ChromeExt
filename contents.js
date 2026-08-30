// youtube側で対象の要素が生成されるまで監視
function waitForElement(selector) {
  return new Promise((resolve) =>{
    if(document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    };
    
    const observer = new MutationObserver(() => {
      if(document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      };
    });

    oberver.observe(document.body, {
      childList:true,
      subtree: true
    });
  });
};


async function initExtension() {
  // 二重追加防止
  if(document.getElementById('shoot')) return;

  // YouTubeの親要素の出現まで待機
  const targetArea = await waitForElement('ytd-watch-metadata');
  const video = await waitForElement('video');

  // buttonを生成
  let shoot = document.createElement('button');
  shoot.id = 'shoot';
  shoot.textContent = 'take a screenshot';

  // ボタン押下でスクショ撮影
  shoot.addEventListener('click', () => {
    // let video = document.querySelector('video');
    // if (!video) return;

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

  // 各ボタンをタイトルの右側の余白に追加
  targetArea.appendChild(shoot);
};



// let nextFr = document.createElement('button'); // 1フレ先へ
// nextFr.id = 'nextFr';
// let prevFr = document.createElement('button'); // 1フレ前へ
// prevFr.id = 'prevFr';
// let nextSec = document.createElement('button'); // 1sec先へ
// nextSec.id = 'nextSec';
// let prevSec = document.createElement('button'); // 1sec前へ
// prevSec.id = 'prevSec';
