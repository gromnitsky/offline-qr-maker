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

#container { margin: var(--gutter); }
#qr { height: calc(var(--dialog_h) - var(--gutter)*3 - var(--form_h)); }
</style>

<dialog>
<form>
  <input type="button" name="close" value="Close">
  <input type="search" spellcheck="false" maxlength="2500" name="text">
  <input type="submit" name="update">
</form>
<div id="container"><div id="qr"></div></div>
</dialog>
`
    document.body.appendChild(dialog)

    let qr = new QR(dialog.shadowRoot)
    chrome.runtime.onMessage.addListener( (req, sender, res) => {
	console.log('pong', sender.id)
	qr.toggle()
	qr.text = req
	qr.focus()

	res(true)
    })
}

class QR {
    constructor(node) {
	this.dialog = node.querySelector('dialog')
	this.form = node.querySelector('form')
	this.output = node.querySelector('#qr')
	this.maker = new QRCode(this.output, {
	    useSVG: true, correctLevel: QRCode.CorrectLevel.L
	})
	this.form.onsubmit = node => { node.preventDefault(); this.update() }
	this.form.close.onclick = () => this.toggle()
	this.form.text.onkeydown = evt => {
	    evt.key === 'Escape' && !this.input() && this.toggle()
	}

	this.form.text.oninput = debounce(() => this.update_info(), 500)
    }

    toggle() { this.dialog.open ? this.dialog.close() : this.dialog.showModal() }

    set text(val) {
	this.form.text.value = val
	this.update()
    }

    focus() { this.form.text.focus() }

    input() { return this.form.text && this.form.text.value.trim() }

    update() {
	this.input() ? this.maker.makeCode(this.input()) : this.output.innerHTML = 'No input'
	this.output.removeAttribute('title')
	this.update_info()
    }

    update_info() {
	this.form.update.value = `Update (${this.input().length})`
    }
}

function debounce(fn, ms = 0) {
    let id
    return function(...args) {
	clearTimeout(id)
	id = setTimeout(() => fn.apply(this, args), ms)
    }
}

main()
