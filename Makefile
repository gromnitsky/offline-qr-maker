# make crx
# watchthis.sound -e src/flycheck_\* -e _out -- make browser=firefox

$(if $(MAKE_RESTARTS), $(info RESTARTING MAKE))

browser := chrome
out := _out/$(shell git rev-parse --abbrev-ref HEAD)/$(browser)

all:

npm.src := node_modules/qrcode-generator/qrcode.js \
	node_modules/qrcode-generator/qrcode_SJIS.js
include extensions.mk

all: $(dest)
