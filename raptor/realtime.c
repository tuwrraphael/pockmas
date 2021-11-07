#include "realtime.h"
#include "bump_allocator.h"
#include "calendar_utils.h"

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
				boolean_t found = FALSE;
				if (is_last_trip)
				{
					stoptime_update->num_matches[update_idx]++;
					stoptime_update->results[update_idx].route_id = diva_route->route_id;
					stoptime_update->results[update_idx].trip = trip;
					stoptime_update->results[update_idx].realtime_offset = stoptime_at_trip->departure_time - stoptime_update->time_real[update_idx];
					found = TRUE;
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
						stoptime_update->num_matches[update_idx]++;
						stoptime_update->results[update_idx].route_id = diva_route->route_id;
						stoptime_update->results[update_idx].trip = trip;
						stoptime_update->results[update_idx].realtime_offset = offset_to_current_trip;
						found = TRUE;
					}
					else
					{

						// next trip is early
						stoptime_update->num_matches[update_idx]++;
						stoptime_update->results[update_idx].route_id = diva_route->route_id;
						stoptime_update->results[update_idx].trip = next_trip;
						stoptime_update->results[update_idx].realtime_offset = 0 - offset_to_next_trip;
						found = TRUE;
					}
				}
				if (found == TRUE)
				{
					if (stoptime_update->apply == TRUE)
					{
						input_data->realtime_offsets[input_data->realtime_index[diva_route->route_id].realtime_index + stoptime_update->results[update_idx].trip] = stoptime_update->results[update_idx].realtime_offset;
					}
					update_idx++;
				}
			}
		}
	}
}
