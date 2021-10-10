#ifndef STOPSEARCH_H
#define STOPSEARCH_H

#include <stdint.h>

#define MAX_TRIE_DEPTH (30)

typedef struct
{
	uint16_t num_children;
	uint16_t num_results;
	uint32_t children_index;
	uint32_t results_index;
} trie_node_t;

typedef struct
{
	uint8_t letter;
} children_lookup_t;

typedef struct
{
	uint32_t index;
} children_index_t;

typedef struct
{
	uint16_t stopgroup;
} trie_node_result_t;

typedef struct
{
	trie_node_t* nodes;
	children_lookup_t* children_lookup;
	children_index_t* children_index;
	trie_node_result_t* results;
} stopsearch_index_t;

typedef struct {
	uint32_t num_results;
	trie_node_result_t* results;
} stopsearch_result_t;

#ifdef __cplusplus
extern "C"
{
#endif

	void* stopsearch_allocate(uint32_t num_nodes, uint32_t num_children, uint32_t num_results);
	stopsearch_result_t* stopsearch_reset();
	stopsearch_result_t* stopsearch_step(uint8_t letter);

#ifdef __cplusplus
}
#endif

#endif