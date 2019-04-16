out := _out
ext := $(out)/ext
pkg := $(out)/$(shell json -d- -a name version < src/manifest.json | tr ' ' -)
crx := $(pkg).crx
zip := $(pkg).zip

all:
compile.all :=

$(ext)/vendor/%: node_modules/%; $(copy)
compile.all += $(addprefix $(ext)/vendor/, qrcode-generator/qrcode.js)

$(ext)/%: src/%; $(copy)
compile.all += $(patsubst src/%, $(ext)/%, $(wildcard src/*))

all: $(compile.all)



crx: $(crx)
%.crx: %.zip private.pem
	crx3-new private.pem < $< > $@

private.pem:
	openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out $@

zip: $(zip)
%.zip: $(compile.all)
	cd $(ext) && zip -qr $(CURDIR)/$@ *

upload: $(crx)
	scp $< gromnitsky@web.sourceforge.net:/home/user-web/gromnitsky/htdocs/js/chrome/

define copy =
@mkdir -p $(dir $@)
cp $< $@
endef

.DELETE_ON_ERROR:
