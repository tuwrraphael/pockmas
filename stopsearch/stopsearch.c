#include "stopsearch.h"
#include "bump_allocator.h"

static stopsearch_index_t stopsearch_index;

void *stopsearch_allocate(uint32_t num_nodes, uint32_t num_children, uint32_t num_results)
{
	unsigned char* memory = malloc(num_nodes * sizeof(trie_node_t) + num_children * sizeof(children_lookup_t) + num_children * sizeof(children_index_t) + num_results * sizeof(trie_node_result_t));
	stopsearch_index.nodes = (void *)memory;
	stopsearch_index.children_lookup = (void *)(memory + num_nodes * sizeof(trie_node_t));
	stopsearch_index.children_index = (void *)(memory + num_children * sizeof(children_lookup_t) + num_nodes * sizeof(trie_node_t));
	stopsearch_index.results = (void *)(memory + num_children * sizeof(children_index_t) + num_children * sizeof(children_lookup_t) + num_nodes * sizeof(trie_node_t));
	return memory;
}

static stopsearch_result_t *result = NULL;
static trie_node_t *current_node = NULL;

stopsearch_result_t *stopsearch_reset()
{
	if (result == NULL)
	{
		result = malloc(sizeof(stopsearch_result_t));
	}
	current_node = &stopsearch_index.nodes[0];
	result->num_results = current_node->num_results;
	result->results = &stopsearch_index.results[current_node->results_index];
	return result;
}

stopsearch_result_t *stopsearch_step(uint8_t letter)
{
	if (current_node->num_children > 0)
	{
		for (uint32_t children_index = current_node->children_index; children_index < current_node->children_index + current_node->num_children; children_index++)
		{
			if (stopsearch_index.children_lookup[children_index].letter == letter)
			{
				current_node = &stopsearch_index.nodes[stopsearch_index.children_index[children_index].index];
				result->num_results = current_node->num_results;
				result->results = &stopsearch_index.results[current_node->results_index];
			}
			else if (stopsearch_index.children_lookup[children_index].letter > letter)
			{
				break;
			}
		}
	}
	return result;
}