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

function dialog(tab, text, retry) {
    chrome.tabs.sendMessage(tab.id, text, res => {
        if (!res && !retry) {   // repeat only once
            inject_content_scripts(tab).then( ()=> dialog(tab, text, true))
        }
    })
}

function inject_content_scripts(tab) {
    return ['node_modules/qrcode-generator/qrcode.js',
            'node_modules/qrcode-generator/qrcode_SJIS.js',
            'content_script.js']
        .reduce( (a, c) => a.then(() => inject_js(tab,c)), Promise.resolve())
}

function inject_js(tab, file) {
    return chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: [file]
    }).then( r => {
        if (r[0].error) throw new Error(r[0].error)
        console.log('executeScript', file)
    })
}
