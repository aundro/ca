
.PHONY: dirs clean

INJECT_SCRIPT=tools/inject.py
INJECT=python $(INJECT_SCRIPT)
#BLD=build
BLD=alt_build
SRC_FILES=$(wildcard src/*)
DST_FILES=$(patsubst src/%,$(BLD)/%,$(SRC_FILES))

DAT_FILES=$(wildcard data/*.dat) $(wildcard data/*/*.dat)
SRC_D3_FILES=$(wildcard 3rd-party/*)
DST_D3_FILES=$(patsubst 3rd-party/%,$(BLD)/%,$(SRC_D3_FILES))
COMMON_DEPS=$(DAT_FILES) $(DST_D3_FILES)

all: $(DST_FILES)

dirs:
	@test -d $(BLD) || mkdir -p $(BLD)

clean:
	rm -rf $(BLD)/

$(BLD)/%.html: src/%.html \
	$(INJECT_SCRIPT) \
	$(COMMON_DEPS) \
	tools/header_fragment.html | dirs
	$(INJECT) -i $< -o $@

$(BLD)/%: src/% $(COMMON_DEPS) | dirs
	cp $< $@

$(BLD)/d3.js: 3rd-party/d3.js | dirs
	cp $< $@

$(BLD)/d3.min.js: 3rd-party/d3.min.js | dirs
	cp $< $@
