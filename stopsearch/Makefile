
.PHONY: clean
default: stopsearch.wasm

FILES = build/stopsearch.o \
build/stdlib/bump_allocator.o \
build/stdlib/memset.o

INCLUDE = -I../stdlib

OPT = -O0
DEFINE = -DWASM_BUILD

ifeq ($(LD),)
	LD = wasm-ld
endif
ifeq ($(LD),ld)
	LD = wasm-ld
endif
ifeq ($(CC),)
	CC = clang
endif
ifeq ($(CC),cc)
	CC = clang
endif


CFLAGS = $(INCLUDE) $(OPT) $(DEFINE) --target=wasm32 -g

build:
	mkdir $@

build/stdlib:
	mkdir -p $@

build/%.o: %.c Makefile | build
	$(CC) $(CFLAGS) -c $< -o $@

build/stdlib/%.o: ../stdlib/%.c Makefile | build/stdlib
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -rf build stopsearch.wasm

stopsearch.wasm: $(FILES)
	$(LD) --no-entry --export-all -O0 -o $@ $^