// 画像の保存処理
chrome.runtime.onMessage.addListener( (msg, sender, sendResponse) => {
    if (msg.action === 'download') {
        chrome.downloads.download({
            url: msg.url,
            filename: msg.filename
        })
    }
})