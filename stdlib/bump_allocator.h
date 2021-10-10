#ifndef BUMP_ALLOCATOR_H
#define BUMP_ALLOCATOR_H
#include <stddef.h>

#ifdef WASM_BUILD
void *malloc(size_t number_of_bytes);
#else
#include <malloc.h>
#endif

void create_savepoint(void);
void reset_to_savepoint(void);

#endif