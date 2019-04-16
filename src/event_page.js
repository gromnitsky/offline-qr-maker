'use strict'

chrome.browserAction.onClicked.addListener(dialog)

function dialog(tab, retry) {
    console.log('click', tab.url)
    chrome.tabs.sendMessage(tab.id, tab.url, res => {
	if (!res && !retry) {
	    inject_content_scripts().then( ()=> {
		setTimeout( () => dialog(tab, true), 100) // FIXME
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
