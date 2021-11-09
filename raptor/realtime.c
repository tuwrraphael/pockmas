#include "realtime.h"
#include "bump_allocator.h"
#include "calendar_utils.h"

typedef struct
{
	route_id_t route_id;
	uint16_t trip;
	int32_t realtime_offset;
	boolean_t set;
	boolean_t was_last_trip;
} best_result_t;

stoptime_update_t *stoptime_update;

void initialize_realtime_memory(input_data_t *input_data)
{
	uint32_t idx = 0;
	input_data->realtime_index = malloc(sizeof(real_time_index_t) * input_data->route_count);
	for (uint16_t route_id = 0; route_id < input_data->route_count; route_id++)
	{
		input_data->realtime_index[route_id].realtime_index = idx;
		idx += input_data->routes[route_id].trip_count;
	}
	input_data->realtime_offsets = malloc(sizeof(int16_t) * idx);
	for (uint32_t i = 0; i < idx; i++)
	{
		input_data->realtime_offsets[i] = 0;
	}
	stoptime_update = malloc(sizeof(stoptime_update_t));
}

stoptime_update_t *get_stoptime_update_memory()
{
	return stoptime_update;
}

static int32_t get_next_trip_in_service(input_data_t *input_data, route_t *route, uint16_t trip, uint32_t date, uint8_t weekday)
{
	for (uint16_t t = trip + 1; t < route->trip_count; t++)
	{
		if (trip_serviced_at_date(input_data, route, t, date, weekday) == TRUE)
		{
			return t;
		}
	}
	return -1;
}

static int32_t abs(int32_t value)
{
	if (value < 0)
	{
		return -value;
	}
	return value;
}

void process_stoptime_update(input_data_t *input_data)
{
	for (uint8_t i = 0; i < stoptime_update->num_updates; i++)
	{
		stoptime_update->num_matches[i] = 0;
	}
	uint16_t diva_index;
	for (diva_index = 0; diva_index < input_data->diva_count; diva_index++)
	{
		if (input_data->diva_index[diva_index].diva == stoptime_update->diva)
		{
			break;
		}
	}
	diva_index_t *diva_index_obj = &input_data->diva_index[diva_index];
	best_result_t best_results[MAX_STOPTIME_UPDATES];
	for (uint8_t i = 0; i < MAX_STOPTIME_UPDATES; i++)
	{
		best_results[i].set = FALSE;
		best_results[i].was_last_trip = FALSE;
	}
	for (uint32_t diva_route_idx = diva_index_obj->diva_routes_index; diva_route_idx < diva_index_obj->diva_routes_index + diva_index_obj->diva_routes_count; diva_route_idx++)
	{
		diva_route_t *diva_route = &input_data->diva_routes[diva_route_idx];
		if (diva_route->linie_id == stoptime_update->linie && diva_route->direction == stoptime_update->direction)
		{
			route_t *route = &input_data->routes[diva_route->route_id];
			uint8_t update_idx = 0;
			for (uint16_t trip = 0; trip < route->trip_count; trip++)
			{
				if (update_idx >= stoptime_update->num_updates)
				{
					break;
				}
				if (trip_serviced_at_date(input_data, route, trip, stoptime_update->date, stoptime_update->weekday) == FALSE)
				{
					continue;
				}

				// TODO optimize loop by using while and advancing to next_trip on end
				int32_t next_trip = get_next_trip_in_service(input_data, route, trip, stoptime_update->date, stoptime_update->weekday);

				boolean_t is_last_trip = next_trip == -1;
				stop_time_t *stoptime_at_trip = &input_data->stop_times[route->stop_time_idx + (trip * route->stop_count) + diva_route->stop_offset];
				int32_t found_trip = -1;
				int32_t realtime_offset = INT32_MAX;
				if (is_last_trip)
				{
					realtime_offset = stoptime_at_trip->departure_time - stoptime_update->time_real[update_idx];
					found_trip = trip;
				}
				else
				{
					stop_time_t *stoptime_at_next_trip = &input_data->stop_times[route->stop_time_idx + ((next_trip)*route->stop_count) + diva_route->stop_offset];
					if (stoptime_at_next_trip->departure_time < stoptime_update->time_real[update_idx])
					{
						continue;
					}
					int32_t offset_to_current_trip = stoptime_update->time_real[update_idx] - stoptime_at_trip->departure_time;
					int32_t offset_to_next_trip = stoptime_at_next_trip->departure_time - stoptime_update->time_real[update_idx];
					if (offset_to_current_trip <= offset_to_next_trip)
					{
						// current trip is late
						realtime_offset = offset_to_current_trip;
						found_trip = trip;
					}
					else
					{
						// next trip is early
						realtime_offset = 0 - offset_to_next_trip;
						found_trip = next_trip;
					}
				}
				if (found_trip > -1)
				{
					if (best_results[update_idx].set == FALSE ||
						(abs(realtime_offset) < abs(best_results[update_idx].realtime_offset)))
					{
						best_results[update_idx].set = TRUE;
						best_results[update_idx].route_id = diva_route->route_id;
						best_results[update_idx].trip = (uint16_t)found_trip;
						best_results[update_idx].realtime_offset = realtime_offset;
						best_results[update_idx].was_last_trip = is_last_trip;
						if (is_last_trip == FALSE)
						{
							stoptime_update->num_matches[update_idx]++;
						}
					}
					update_idx++;
				}
			}
		}
	}
	for (uint8_t i = 0; i < stoptime_update->num_updates; i++)
	{
		if (best_results[i].set == TRUE)
		{
			stoptime_update->results[i].trip = best_results[i].trip;
			stoptime_update->results[i].route_id = best_results[i].route_id;
			stoptime_update->results[i].realtime_offset = (int16_t)best_results[i].realtime_offset;
			if (best_results[i].was_last_trip == TRUE)
			{
				stoptime_update->num_matches[i]++;
			}
			if (stoptime_update->apply)
			{
				input_data->realtime_offsets[input_data->realtime_index[best_results[i].route_id].realtime_index + best_results[i].trip] = best_results[i].realtime_offset;
			}
		}
	}
}
