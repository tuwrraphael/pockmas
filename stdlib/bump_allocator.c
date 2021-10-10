#include <stddef.h>
#include "bump_allocator.h"

#ifdef WASM_BUILD

extern unsigned char __heap_base;

unsigned char *bump_pointer = &__heap_base;
unsigned char *savepoint;

void *malloc(size_t number_of_bytes)
{
  unsigned int r = (unsigned int)bump_pointer;
  bump_pointer += number_of_bytes;
  size_t memory_size = __builtin_wasm_memory_size(0) * 65536;
  if (memory_size - (r - __heap_base) < number_of_bytes)
  {
    __builtin_wasm_memory_grow(0, 1 + number_of_bytes / 65536);
  }
  return (void *)r;
}

#endif

void create_savepoint(void)
{
#ifdef WASM_BUILD
  savepoint = bump_pointer;
#endif
}
void reset_to_savepoint(void)
{
#ifdef WASM_BUILD
  bump_pointer = savepoint;
#endif
}