#include "stopsearch.h"
#include "bump_allocator.h"

static stopsearch_index_t stopsearch_index;

void *stopsearch_allocate(uint32_t num_nodes, uint32_t num_children, uint32_t num_results)
{
	unsigned char *memory = malloc(num_nodes * sizeof(trie_node_t) + num_children * sizeof(children_lookup_t) + num_children * sizeof(children_index_t) + num_results * sizeof(trie_node_result_t));
	stopsearch_index.nodes = (void *)memory;
	stopsearch_index.children_lookup = (void *)(memory + num_nodes * sizeof(trie_node_t));
	stopsearch_index.children_index = (void *)(memory + num_children * sizeof(children_lookup_t) + num_nodes * sizeof(trie_node_t));
	stopsearch_index.results = (void *)(memory + num_children * sizeof(children_index_t) + num_children * sizeof(children_lookup_t) + num_nodes * sizeof(trie_node_t));
	return memory;
}

static stopsearch_result_t result;
static trie_node_t *current_node = NULL;

stopsearch_result_t *stopsearch_reset()
{
	current_node = &stopsearch_index.nodes[0];
	result.num_results = current_node->num_results;
	result.results = &stopsearch_index.results[current_node->results_index];
	return &result;
}

stopsearch_result_t *stopsearch_step(uint8_t letter)
{
	if (current_node->num_children > 0)
	{
		uint32_t lower = current_node->children_index;
		uint32_t upper = lower + current_node->num_children;
		while (lower < upper)
		{
			uint32_t mid = (lower + upper) / 2;
			if (stopsearch_index.children_lookup[mid].letter == letter)
			{
				current_node = &stopsearch_index.nodes[stopsearch_index.children_index[mid].index];
				result.num_results = current_node->num_results;
				result.results = &stopsearch_index.results[current_node->results_index];
				return &result;
			}
			else if (letter > stopsearch_index.children_lookup[mid].letter)
			{
				lower = mid + 1;
			}
			else
			{
				upper = mid;
			}
		}
	}
	return &result;
}