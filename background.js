// 画像の保存処理
chrome.runtime.onMessage.addListener( (msg, sender, sendResponse) => {
    if (msg.action === 'download') {
        chrome.downloads.download({
            url: msg.url,
            filename: msg.filename
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error('ダウンロードエラー：', chrome.runtime.lastError);
                sendResponse({
                    success: false,
                    error: chrome.runtime.lastError
                });
            } else {
                sendResponse({
                    success: success = true,
                    downloadId: downloadId
                });
            }
        });
        return true;
    } else {
        console.error('その他アクション');
        sendResponse({
            success: false,
            error: 'Unknown action'
        });
    }
});