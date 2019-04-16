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
    return inject_css('content_script.css')
	.then( () => {
	    inject_js('vendor/@keeex/qrcodejs-kx/qrcode.min.js')
	}).then( () => {
	    inject_js('content_script.js')
	})
}

function inject(type, file) {
    return new Promise( (res, rej) => {
	chrome.tabs[type]({file}, () => {
	    chrome.runtime.lastError ? rej(chrome.runtime.lastError) : res(true)
	})
    })
}

function inject_js(file) { return inject('executeScript', file) }
function inject_css(file) { return inject('insertCSS', file) }
