/* global QRCode */
'use strict'

console.log('offline-qr-maker')

function main() {
    let dialog = document.createElement('dialog')
    dialog.className = 'JiA134qZm1'
    dialog.innerHTML = `
<form>
<input type="button" name="close" value="Close">
<input type="search" name="text">
<input type="submit" value="Update">
</form>
<div id="container"><div id="qr"></div></div>
`
    document.body.appendChild(dialog)

    let qr = new QR(dialog)
    message_hooks(qr)
}

function message_hooks(qr) {
    chrome.runtime.onMessage.addListener( (req, sender, res) => {
	console.log('pong', sender.id)
	qr.dialog.open || qr.dialog.showModal()
	qr.form.text.value = req
	qr.update()
	qr.focus()

	res(true)
    })
}

class QR {
    constructor(dialog) {
	this.dialog = dialog
	this.form = dialog.querySelector('form')
	this.output = dialog.querySelector('#qr')
	this.maker = new QRCode(this.output, {
	    width: 10,
	    height: 10,
	    useSVG: true
	})
	this.form.onsubmit = node => { node.preventDefault(); this.update() }
	this.form.close.onclick = () => dialog.close()
	this.form.text.onkeydown = evt => {
	    evt.key === 'Escape' && !this.input() && dialog.close()
	}
    }

    focus() { this.form.text.focus() }

    input() { return this.form.text && this.form.text.value.trim() }

    update() {
	if (!this.input()) { this.output.innerHTML = 'No input'; return }
	this.maker.makeCode(this.input())
    }
}

main()
