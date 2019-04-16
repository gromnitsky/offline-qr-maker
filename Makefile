out := _out
ext := $(out)/ext

all:
compile.all :=

$(ext)/vendor/%: node_modules/%; $(copy)
compile.all += $(addprefix $(ext)/vendor/, @keeex/qrcodejs-kx/qrcode.min.js)

$(ext)/%: src/%; $(copy)
compile.all += $(patsubst src/%, $(ext)/%, $(wildcard src/*))

all: $(compile.all)

define copy =
@mkdir -p $(dir $@)
cp $< $@
endef
