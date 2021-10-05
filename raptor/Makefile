
.PHONY: clean
default: raptor.wasm

FILES = build/raptor.o \
build/bump_allocator.o \
build/memset.o

CC = clang-13
LD = wasm-ld-13

build:
	mkdir $@

build/%.o: %.c | build
	$(CC) --target=wasm32 -O0 -g -c $< -o $@

clean:
	rm -rf build raptor.wasm raptor.wasm.map

raptor.wasm: $(FILES)
	$(LD) --no-entry --export-all -o $@ $^
	python ./wasm-sourcemap.py --dwarfdump /usr/bin/llvm-dwarfdump-13 raptor.wasm -o raptor.wasm.map -u "http://127.0.0.1:8080/raptor/raptor.wasm.map" -w raptor.wasm --basepath .