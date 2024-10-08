/* global qrcode */
'use strict'

function main() {
    let dialog = fetch_txt(chrome.runtime.getURL('dialog.html')).then( html => {
	return new Dialog(html)
    })

    chrome.runtime.onMessage.addListener( (req, sender, res) => {
	res(true)
	console.log('pong', sender.id)

	dialog.then( dlg => {
	    dlg.toggle()
	    dlg.value = req
	})
    })
}

class Dialog {
    constructor(html) {
	this.dlg = this._attach_to_dom(html)
	this.input = this.$('#input')
	this.output = this.$('#output')
	this.ctrl = this._ctrl_setup()
    }

    _attach_to_dom(html) {
	let span = document.createElement('span')
	span.attachShadow({mode: 'open'}).innerHTML = html
	document.body.appendChild(span)
	return span.shadowRoot.querySelector('dialog')
    }

    $(sel) { return this.dlg.querySelector(sel) }

    _ctrl_setup() {
        this.dlg.addEventListener('keydown', evt => {
            // prevent the event from reaching the document
            evt.stopPropagation()
        })

	let form = this.$('form')
	form.onsubmit = evt => (evt.preventDefault(), this._submit())
	form.addEventListener('invalid', () => this.output.innerText = '', true)
	let btn_submit = this.$('input[type="submit"]')

	let ctrl = {
	    submit: () => btn_submit.click(),
	    close: this.$('#ctrl__close'),
	    size: this.$('#ctrl__size'),
	    // TODO: next 4 save/get their values to/from storage
	    type_num: this.$('#type_num'),
	    corr_lev: this.$('#corr_lev'),
	    mode: this.$('#mode'),
	    multibyte: this.$('#multibyte'),
	}

	ctrl.close.onclick = () => this.toggle()
	ctrl.type_num.oninput = () => (this.stat_upd(), ctrl.submit())
	;['corr_lev','mode','multibyte'].forEach( v => {
	    ctrl[v].onchange = () => (this.stat_upd(), ctrl.submit())
	})

	let upd = debounce(() => ctrl.submit(), 300)
	this.input.addEventListener('input', () => upd())
	let stat = debounce(() => this.stat_upd(), 300)
	this.input.addEventListener('input', () => stat())
	this.input.onkeydown = evt => {
	    if (evt.ctrlKey && evt.key === 'c') this.value = ''
	}

	return ctrl
    }

    stat_upd() { this.ctrl.size.innerText = `${this.size.length}/${this.max()}` }

    toggle() {
	if (this.dlg.open) { this.dlg.close(); return }
	this.dlg.showModal()
	this.input.focus()
    }

    set value(val) {
	this.input.value = val
	this.stat_upd()
	this.ctrl.submit()
    }

    _submit() {
	qrcode.stringToBytes = qrcode.stringToBytesFuncs[this.ctrl.multibyte.value]
	let qr = qrcode(Number(this.ctrl.type_num.value), this.ctrl.corr_lev.value)
	qr.addData(this.input.value, this.ctrl.mode.value)
	try {
	    qr.make()
	} catch (err) {
	    this.err(err)
	    return
	}
	this.output.innerHTML = img_b64(qr.createSvgTag(10, 0))
    }

    get size() { // what about SJIS?
	return this.ctrl.multibyte.value === 'UTF-8' ? new TextEncoder().encode(this.input.value) : this.input.value
    }

    err(m) {
	this.output.innerText = (m instanceof Error ? '' : 'Error: ') + m
	console.error('offline-qr-maker:', m)
    }

    max() {
	return this._max(Number(this.ctrl.type_num.value),
			 this.ctrl.corr_lev.value, this.ctrl.mode.value)
    }

    _max(type_num, corr_lev, mode) {
	corr_lev = ['L', 'M', 'Q', 'H'].indexOf(corr_lev)
	mode = ['Numeric', 'Alphanumeric', 'Byte', 'Kanji'].indexOf(mode)
	let data_caps = [
	    // Numeric (L,M,Q,H), Alphanumeric (....), Byte(....), Kanji(....)
	    /*1*/[[41,34,27,17],[25,20,16,10],[17,14,11,7],[10,8,7,4]],
	    /*2*/[[77,63,48,34],[47,38,29,20],[32,26,20,14],[20,16,12,8]],
	    /*3*/[[127,101,77,58],[77,61,47,35],[53,42,32,24],[32,26,20,15]],
	    /*4*/[[187,149,111,82],[114,90,67,50],[78,62,46,34],[48,38,28,21]],
	    /*5*/[[255,202,144,106],[154,122,87,64],[106,84,60,44],[65,52,37,27]],
	    /*6*/[[322,255,178,139],[195,154,108,84],[134,106,74,58],[82,65,45,36]],
	    /*7*/[[370,293,207,154],[224,178,125,93],[154,122,86,64],[95,75,53,39]],
	    /*8*/[[461,365,259,202],[279,221,157,122],[192,152,108,84],[118,93,66,52]],
	    /*9*/[[552,432,312,235],[335,262,189,143],[230,180,130,98],[141,111,80,60]],
	    /*10*/[[652,513,364,288],[395,311,221,174],[271,213,151,119],[167,131,93,74]],
	    /*11*/[[772,604,427,331],[468,366,259,200],[321,251,177,137],[198,155,109,85]],
	    /*12*/[[883,691,489,374],[535,419,296,227],[367,287,203,155],[226,177,125,96]],
	    /*13*/[[1022,796,580,427],[619,483,352,259],[425,331,241,177],[262,204,149,109]],
	    /*14*/[[1101,871,621,468],[667,528,376,283],[458,362,258,194],[282,223,159,120]],
	    /*15*/[[1250,991,703,530],[758,600,426,321],[520,412,292,220],[320,254,180,136]],
	    /*16*/[[1408,1082,775,602],[854,656,470,365],[586,450,322,250],[361,277,198,154]],
	    /*17*/[[1548,1212,876,674],[938,734,531,408],[644,504,364,280],[397,310,224,173]],
	    /*18*/[[1725,1346,948,746],[1046,816,574,452],[718,560,394,310],[442,345,243,191]],
	    /*19*/[[1903,1500,1063,813],[1153,909,644,493],[792,624,442,338],[488,384,272,208]],
	    /*20*/[[2061,1600,1159,919],[1249,970,702,557],[858,666,482,382],[528,410,297,235]],
	    /*21*/[[2232,1708,1224,969],[1352,1035,742,587],[929,711,509,403],[572,438,314,248]],
	    /*22*/[[2409,1872,1358,1056],[1460,1134,823,640],[1003,779,565,439],[618,480,348,270]],
	    /*23*/[[2620,2059,1468,1108],[1588,1248,890,672],[1091,857,611,461],[672,528,376,284]],
	    /*24*/[[2812,2188,1588,1228],[1704,1326,963,744],[1171,911,661,511],[721,561,407,315]],
	    /*25*/[[3057,2395,1718,1286],[1853,1451,1041,779],[1273,997,715,535],[784,614,440,330]],
	    /*26*/[[3283,2544,1804,1425],[1990,1542,1094,864],[1367,1059,751,593],[842,652,462,365]],
	    /*27*/[[3517,2701,1933,1501],[2132,1637,1172,910],[1465,1125,805,625],[902,692,496,385]],
	    /*28*/[[3669,2857,2085,1581],[2223,1732,1263,958],[1528,1190,868,658],[940,732,534,405]],
	    /*29*/[[3909,3035,2181,1677],[2369,1839,1322,1016],[1628,1264,908,698],[1002,778,559,430]],
	    /*30*/[[4158,3289,2358,1782],[2520,1994,1429,1080],[1732,1370,982,742],[1066,843,604,457]],
	    /*31*/[[4417,3486,2473,1897],[2677,2113,1499,1150],[1840,1452,1030,790],[1132,894,634,486]],
	    /*32*/[[4686,3693,2670,2022],[2840,2238,1618,1226],[1952,1538,1112,842],[1201,947,684,518]],
	    /*33*/[[4965,3909,2805,2157],[3009,2369,1700,1307],[2068,1628,1168,898],[1273,1002,719,553]],
	    /*34*/[[5253,4134,2949,2301],[3183,2506,1787,1394],[2188,1722,1228,958],[1347,1060,756,590]],
	    /*35*/[[5529,4343,3081,2361],[3351,2632,1867,1431],[2303,1809,1283,983],[1417,1113,790,605]],
	    /*36*/[[5836,4588,3244,2524],[3537,2780,1966,1530],[2431,1911,1351,1051],[1496,1176,832,647]],
	    /*37*/[[6153,4775,3417,2625],[3729,2894,2071,1591],[2563,1989,1423,1093],[1577,1224,876,673]],
	    /*38*/[[6479,5039,3599,2735],[3927,3054,2181,1658],[2699,2099,1499,1139],[1661,1292,923,701]],
	    /*39*/[[6743,5313,3791,2927],[4087,3220,2298,1774],[2809,2213,1579,1219],[1729,1362,972,750]],
	    /*40*/[[7089,5596,3993,3057],[4296,3391,2420,1852],[2953,2331,1663,1273],[1817,1435,1024,784]]
	]
	let x = data_caps[type_num-1]; if (x == null) x = data_caps[data_caps.length-1]
	let y = x[mode]; if (y == null) return -1
	return y[corr_lev] == null ? -1 : y[corr_lev]
    }
}

function img_b64(s) { return `<img src='data:image/svg+xml;base64,${b64(s)}'>` }

function b64(str) {
    return btoa(encodeURIComponent(str)
		.replace(/%([0-9A-F]{2})/g,
			 (_, p1) => String.fromCharCode('0x' + p1)))
}

function debounce(fn, ms = 0) {
    let id
    return function(...args) {
	clearTimeout(id)
	id = setTimeout(() => fn.apply(this, args), ms)
    }
}

function fetch_txt(url, opt) {
    let fetcherr = r => { if (r.ok) return r; throw new Error(r.status) }
    return fetch(url, opt).then(fetcherr).then( r => r.text())
}

main()
