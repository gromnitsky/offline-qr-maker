/* global QRCode */
'use strict'

console.log('offline-qr-maker')

function main() {
    let dialog = document.createElement('span')
    dialog.attachShadow({mode: 'open'}).innerHTML = `
<style>
dialog {
  --gutter: 10px;
  --dialog_h: 90vh;
  --dialog_w: 90vw;
  --form_h: 1.5em;
  font-family: sans-serif;
  height: var(--dialog_h);
  width: var(--dialog_w);
  padding: 0;
}

form {
  display: flex;
  margin: var(--gutter);
  height: var(--form_h);
}
form input[name="text"] {
  margin: 0 calc(var(--gutter)/2);
  flex: 1;
  padding: 0 0.3em;
}

#output { margin: var(--gutter); }
#output img {
  display: block;
  margin: 0 auto;
  height: calc(var(--dialog_h) - var(--gutter)*3 - var(--form_h));
}
</style>

<dialog>
<form>
  <input type="button" name="close" value="Close">
  <input type="search" spellcheck="false" maxlength="1000" name="text">
  <input type="submit" name="update">
</form>
<div id="output"></div>
<div id="tmp" style="display: none"></div
</dialog>
`
    document.body.appendChild(dialog)

    let qr = new QR(dialog.shadowRoot)
    chrome.runtime.onMessage.addListener( (req, sender, res) => {
	res(true)
	console.log('pong', sender.id)

	qr.toggle()
	qr.text = req
	qr.focus()
    })
}

class QR {
    constructor(node) {
	this.dialog = node.querySelector('dialog')
	this.form = node.querySelector('form')
	this.output = node.querySelector('#output')
	this.tmp = node.querySelector('#tmp')
	this.maker = new QRCode(this.tmp, {
	    useSVG: true, correctLevel: QRCode.CorrectLevel.L
	})
	this.form.onsubmit = node => { node.preventDefault(); this.update() }
	this.form.close.onclick = () => this.toggle()
	this.form.text.onkeydown = evt => {
	    evt.key === 'Escape' && !this.input() && this.toggle()
	}

	this.form.text.oninput = debounce(() => this.update_info(), 500)
	this.max = 1000
    }

    toggle() { this.dialog.open ? this.dialog.close() : this.dialog.showModal() }

    set text(val) {
	this.form.text.value = val
	this.update()
    }

    focus() { this.form.text.focus() }

    input() {
	return this.form.text && this.form.text.value.trim().slice(0, this.max)
    }

    update() {
	if (!this.input()) { this.output.innerHTML = 'No input'; return }

	this.maker.makeCode(this.input())
	let svg = this.tmp.innerHTML.replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ')
	this.output.innerHTML = img_b64(svg)
	this.update_info()
    }

    update_info() {
	this.form.update.value = `Update (${this.input().length})`
    }
}

function img_b64(svg) {
    return `<img src='data:image/svg+xml;base64,${b64(svg)}'>`
}

function b64(str) {
    return btoa(encodeURIComponent(str)
		.replace(/%([0-9A-F]{2})/g,
			 (match, p1) => String.fromCharCode('0x' + p1)))
}

function debounce(fn, ms = 0) {
    let id
    return function(...args) {
	clearTimeout(id)
	id = setTimeout(() => fn.apply(this, args), ms)
    }
}

main()
