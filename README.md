# Offline QR Maker

(Download the .crx file
[here](http://gromnitsky.users.sourceforge.net/js/chrome/).)

A Chrome 73+ extension for generating QR codes from urls, text
selections or user input.

* `activeTab` permission, instead of `<all_urls>`;
* user can save an svg of a qr code;
* a responsive modal dialog;
* uses a canonical `qrcode-generator` lib from [Kazuhiko
  Arase](https://github.com/kazuhikoarase/qrcode-generator/tree/master/js);
* a non-persistent bg page.

![a screen shot](https://ultraimg.com/images/2019/04/17/ZcrT.png)

## Compilation

~~~
$ npm -g i json crx3-utils
$ npm i
$ make crx
~~~

The result should be in `_out` dir.

## Bugs

* Instagram blocks dialog controls.

## License

MIT.
