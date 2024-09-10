chrome.action.onClicked.addListener( tab => dialog(tab, tab.url))
chrome.runtime.onInstalled.addListener(() => {
    console.info('add a menu item')
    chrome.contextMenus.create({
        "id": "0",
        "title": "Make QR code",
        "contexts": ["link", 'image', 'selection']
    })
})
chrome.contextMenus.onClicked.addListener( (info, tab) => {
    dialog(tab, info.selectionText || info.linkUrl || info.srcUrl)
})

// I get "Unchecked runtime.lastError: Could not establish
// connection. Receiving end does not exist." error when doing
// sendMessage() for the 1st time, hence the 'retry' argument
function dialog(tab, text, retry) {
    console.log('dialog', text.slice(0, 20))
    chrome.tabs.sendMessage(tab.id, text, res => {
        if (!res && !retry) {   // repeat only once
            inject_content_scripts(tab).then( ()=> dialog(tab, text, true))
        }
    })
}

function inject_content_scripts(tab) {
    return ['vendor/qrcode-generator/qrcode.js',
            'vendor/qrcode-generator/qrcode_SJIS.js',
            'content_script.js']
        .reduce( (a, c) => a.then(() => inject_js(tab,c)), Promise.resolve())
}

function inject_js(tab, file) {
    return new Promise( (res, rej) => {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: [file]
        }, () => {
            console.log('executeScript', file)
            chrome.runtime.lastError ? rej(chrome.runtime.lastError) : res(true)
        })
    })
}
