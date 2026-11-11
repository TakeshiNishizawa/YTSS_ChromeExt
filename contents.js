/* 
* 初期化処理
*/
async function initExtension() {
  if (!window.location.pathname.includes('/watch')) return;

    // YouTubeの親要素の出現まで待機
    const targetArea = await waitForElement('ytd-watch-metadata');
    const video = await waitForElement('video');

    if (targetArea && video) {
      injectButtons();
    }
};


/* youtube側で対象の要素が生成されるまで監視
* (selector: 監視対象の要素)
*/
function waitForElement(selector) {
  return new Promise((resolve) =>{
    const existingElement = document.querySelector(selector);
    if(existingElement) {
      return resolve(existingElement);
    };
    
    const observer = new MutationObserver((mutation, obs) => {
      const targetElement = document.querySelector(selector);
      if(targetElement) {
        resolve(targetElement);
        obs.disconnect();
      }
    });

    const target = document.body || document.documentElement;
    observer.observe(target, {
      childList:true,
      subtree: true
    });
  });
};


/* 
* ボタン生成 
* (idName: ID名, textContents: テキストコンテンツ)
*/
var ytssChrmExtBtnWrapper;
var shoot;
var moveNextFrame;
var moveBackFrame;
var moveNextOneSec;
var moveBackOneSec;

function injectButtons () {
  // 二重追加防止
  if(document.getElementById('ytssChrmExtBtnWrapper')) {
    document.getElementById('ytssChrmExtBtnWrapper').remove();
  };

  // グループ追加
  ytssChrmExtBtnWrapper = document.createElement("div");
  ytssChrmExtBtnWrapper.id = 'ytssChrmExtBtnWrapper';

  // スクショボタン
  shoot = document.createElement('button');
  shoot.id = 'shoot';
  shoot.title = 'take a screenshot';
  if (!document.getElementById('iconLinkShoot')) {
    let iconLinkShoot = document.createElement('link');
    iconLinkShoot.id = 'iconLinkShoot'
    iconLinkShoot.rel = 'stylesheet';
    iconLinkShoot.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';
    document.head.appendChild(iconLinkShoot);
  }
  let shootImage = document.createElement('span');
  shootImage.classList.add('material-symbols-outlined');
  shootImage.textContent = 'photo_camera';
  shoot.appendChild(shootImage);
  // ボタン押下時処理
  shoot.addEventListener('click', async () => {
    try {
      // canvasを生成して描画
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      let video = document.querySelector('video');
      if (!video.videoWidth || !video.videoHeight) {
        console.error('ビデオサイズが取得できません。');
        return;
      }else {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      let dataURL = canvas.toDataURL('image/png');
      // ファイル名称 (動画タイトル)
      let titleElement = document.querySelector('h1.ytd-watch-metadata');
      let fileName = titleElement ? titleElement.textContent.trim().replace(/[/\\?%*:|"<>]/g,'_') : 'yt_ss';
      // ダウンロード
      const response = await chrome.runtime.sendMessage({
        action: 'download',
        url: dataURL,
        filename: fileName + '.png'
      });
      if(!response?.success) {
        console.error('スクリーンショットの保存に失敗しました。', response?.error);
      };
    } catch (error) {
      console.error('スクリーンショット処理でエラー：', error);
    }
  });

  // 次フレーム移動ボタン
  moveNextFrame = document.createElement('button');
  moveNextFrame.id = 'moveNextFrame';
  moveNextFrame.title = 'next to 1 frame';
  let mvNxtFrImage = document.createElement('span');
  mvNxtFrImage.classList.add('material-symbols-outlined');
  mvNxtFrImage.textContent = 'keyboard_arrow_right';
  moveNextFrame.appendChild(mvNxtFrImage);
  // ボタン押下時処理
  moveNextFrame.addEventListener('click', () => {
    document.querySelector('video').currentTime = calcTime('fw1Fr');
  });

  // 前フレーム移動ボタン
  moveBackFrame = document.createElement('button');
  moveBackFrame.id = 'moveBackFrame';
  moveBackFrame.title = 'back to 1 frame';
  let mvBckFrImage = document.createElement('span');
  mvBckFrImage.classList.add('material-symbols-outlined');
  mvBckFrImage.textContent = 'keyboard_arrow_left';
  moveBackFrame.appendChild(mvBckFrImage);
  // 前フレーム移動ボタン押下時処理
  moveBackFrame.addEventListener('click', () => {
    // 現在の再生時間取得
    document.querySelector('video').currentTime = calcTime('bw1Fr');
  });

  // 1秒後フレーム移動ボタン
  moveNextOneSec = document.createElement('button');
  moveNextOneSec.id = 'moveNextOneSec';
  moveNextOneSec.title = 'next to 1 sec';
  let mvNxtOneSecImage = document.createElement('span');
  mvNxtOneSecImage.classList.add('material-symbols-outlined');
  mvNxtOneSecImage.textContent = 'keyboard_double_arrow_right';
  moveNextOneSec.appendChild(mvNxtOneSecImage);
  // 1秒後フレーム移動ボタン押下時処理
  moveNextOneSec.addEventListener('click', () => {
    document.querySelector('video').currentTime = calcTime('fw1Sec');
  });

  // 1秒前フレーム移動ボタン
  moveBackOneSec = document.createElement('button');
  moveBackOneSec.id = 'moveBackOneSec';
  moveBackOneSec.title = 'back to 1 sec';
  let mvBckOneSecImage = document.createElement('span');
  mvBckOneSecImage.classList.add('material-symbols-outlined');
  mvBckOneSecImage.textContent = 'keyboard_double_arrow_left';
  moveBackOneSec.appendChild(mvBckOneSecImage);
  // 1秒前フレーム移動ボタン押下時処理
  moveBackOneSec.addEventListener('click', () => {
    document.querySelector('video').currentTime = calcTime('bw1Sec');
  });

  // ボタンをボタングループに追加
  ytssChrmExtBtnWrapper.appendChild(moveBackOneSec);
  ytssChrmExtBtnWrapper.appendChild(moveBackFrame);
  ytssChrmExtBtnWrapper.appendChild(shoot);
  ytssChrmExtBtnWrapper.appendChild(moveNextFrame);
  ytssChrmExtBtnWrapper.appendChild(moveNextOneSec);

  // ボタンのグループを追加
  let titleArea = document.getElementById('title-row');console.log(titleArea);
  // タイトルの省略表記
  // let maxLength = 35;
  // if (titleArea.textContent > maxLength) {
  //   titleArea.textContent = titleArea.textContent.slice(0,maxLength) + '…';
  // }
  titleArea.appendChild(ytssChrmExtBtnWrapper);
  titleArea.style.display = 'flex';
  titleArea.style.justifyContent = 'space-between';
};


/*
* 時間の計算
* (calcOpt: 時間計算方法の種類)
*/
function calcTime (calcOpt) {
  // 現在時間の取得 (秒形式)
  let currentTime = document.querySelector('video').currentTime;
  // 引数によりパターン別に計算
  switch (calcOpt) {
    case 'fw1Fr':
      return currentTime += Number(0.016667); // 60fps想定
      break;
    case 'bw1Fr':
      return currentTime -= Number(0.016667); // 60fps想定
      break;
    case 'fw1Sec':
      return currentTime += Number(1.000000);
      break;
    case 'bw1Sec':
      return currentTime -= Number(1.000000);
      break;
  }
}


// 初回実行
initExtension();

// 再生動画切替時のイベント補足のためにリスナーを追加
window.addEventListener ("yt-navigate-finish", (e) => {
  initExtension();
});

// 画面リロード時にも対応
const persistentObserver = new MutationObserver(() => {
  if (!window.location.pathname.includes('/watch')) return;

  // ボタンの配置先は既に存在しているのにボタングループがない場合、再度生成～配置。
  const injectArea = document.querySelector('ytd-watch-metadata');
  const existingBtn = document.getElementById('ytssChrmExtBtnWrapper');
  if (injectArea && !existingBtn) {
    injectButtons();
  }
});

persistentObserver.observe(document.body, {
  childList: true,
  subtree: true
})