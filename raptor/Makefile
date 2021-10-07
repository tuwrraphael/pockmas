
.PHONY: clean
default: raptor.wasm

FILES = build/raptor.o \
build/bump_allocator.o \
build/memset.o

CC = clang
LD = wasm-ld

build:
	mkdir $@

build/%.o: %.c Makefile | build
	$(CC) -DWASM_BUILD --target=wasm32 -g -O0 -c $< -o $@

clean:
	rm -rf build raptor.wasm

raptor.wasm: $(FILES)
	$(LD) --no-entry --export-all -O0 -o $@ $^