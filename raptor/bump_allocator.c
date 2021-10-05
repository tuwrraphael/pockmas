extern unsigned char __heap_base;

unsigned char *bump_pointer = &__heap_base;

void *allocate(int number_of_bytes) {
  unsigned int r = (unsigned int)bump_pointer;
  bump_pointer += number_of_bytes;
  return (void *)r;
}