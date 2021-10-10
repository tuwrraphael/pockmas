#include <iostream>
#include "stopsearch.h"
#include <vector>
#include <fstream>
#include <iterator>
#include <chrono>


int main()
{
	std::ifstream file("../stop_search.bin", std::ios::binary);
	std::size_t byteSizes[4];
	file.read((char*)&byteSizes, sizeof(std::size_t) * 4);
	void* mem = stopsearch_allocate(byteSizes[0] / sizeof(trie_node_t), byteSizes[1] / sizeof(children_lookup_t), byteSizes[3] / sizeof(trie_node_result_t));
	file.seekg(0, std::ios_base::end);
	std::size_t size = file.tellg();
	file.seekg(16, std::ios_base::beg);
	file.read((char*)mem, size-16);
	file.close();

	stopsearch_reset();
	stopsearch_step('k');
	stopsearch_step('a');
	stopsearch_step('r');
	stopsearch_step('l');
	stopsearch_result_t* res = stopsearch_step('s');

}
