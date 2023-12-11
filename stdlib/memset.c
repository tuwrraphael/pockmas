#include <stdint.h>

void *memset(void *dest, int c, unsigned long n) {
	return __builtin_memset(dest, c, n);
}