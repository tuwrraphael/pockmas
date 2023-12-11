
.PHONY: clean
default: stopsearch.wasm

FILES = build/stopsearch.o \
build/stdlib/bump_allocator.o \
build/stdlib/memset.o

INCLUDE = -I../stdlib

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
ifeq ($(MODE),PRODUCTION)
	COPT = -O3
	LDOPT = -O3
else
	COPT = -O0 -g
	LDOPT = -O0
endif


CFLAGS = $(INCLUDE) $(COPT) $(DEFINE) --target=wasm32 -mbulk-memory

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
	$(LD) --no-entry $(LDOPT) -o $@ $^