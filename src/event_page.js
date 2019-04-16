'use strict'

chrome.browserAction.onClicked.addListener( tab => dialog(tab, tab.url))
chrome.runtime.onInstalled.addListener(() => {
    console.info('add a menu item')
    chrome.contextMenus.create({
	"id": "0",
	"title": "Make a QR code",
	"contexts": ["link", 'image']
    })
})
chrome.contextMenus.onClicked.addListener( (info, tab) => {
    dialog(tab, info.linkUrl || info.srcUrl)
})

function dialog(tab, text, retry) {
    console.log('dialog', text)
    chrome.tabs.sendMessage(tab.id, text, res => {
	if (!res && !retry) {
	    inject_content_scripts().then( ()=> {
		setTimeout( () => dialog(tab, text, true), 100) // FIXME
	    })
	}
    })
}

function inject_content_scripts() {
    return ['vendor/@keeex/qrcodejs-kx/qrcode.min.js', 'content_script.js']
	.reduce( (a, c) => a.then(() => inject_js(c)), Promise.resolve())
}

function inject_js(file) {
    return new Promise( (res, rej) => {
	chrome.tabs.executeScript({file}, () => {
	    console.log('executeScript', file)
	    chrome.runtime.lastError ? rej(chrome.runtime.lastError) : res(true)
	})
    })
}
