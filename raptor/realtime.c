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
	for (uint16_t t = trip; t < route->trip_count; t++)
	{
		if (trip_serviced_at_date(input_data, route, t, date, weekday) == TRUE)
		{
			return t;
		}
	}
	return -1;
}

static int32_t get_last_trip_in_service(input_data_t *input_data, route_t *route, uint16_t trip, uint32_t date, uint8_t weekday)
{
	for (int32_t t = trip; t >= 0; t--)
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

static void set_best_result(best_result_t *best_result, route_id_t route_id, uint16_t trip, int32_t realtime_offset)
{
	if (best_result->set == FALSE || abs(realtime_offset) < abs(best_result->realtime_offset))
	{
		best_result->route_id = route_id;
		best_result->trip = trip;
		best_result->realtime_offset = realtime_offset;
		best_result->set = TRUE;
	}
}

typedef struct
{
	uint16_t trip;
	int32_t realtime_offset;
} trip_offset_t;

// a < real < b
static trip_offset_t get_closer_trip(uint16_t trip_a, uint16_t trip_b, timeofday_t stop_time_a, timeofday_t stop_time_b, timeofday_t time_real)
{
	trip_offset_t result;
	int32_t offset_a = time_real - stop_time_a;
	int32_t offset_b = stop_time_b - time_real;
	// a is late
	if (offset_a < offset_b)
	{
		result.trip = trip_a;
		result.realtime_offset = offset_a;
	}
	else
	{ // b is early
		result.trip = trip_b;
		result.realtime_offset = -offset_b;
	}
	return result;
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

			// check day before after midnight
			datetime_t date_yesterday = stoptime_update->date - ONE_DAY;
			uint8_t weekday_yesterday = weekday_before(stoptime_update->weekday);
			int32_t trip = get_last_trip_in_service(input_data, route, route->trip_count - 1, date_yesterday, weekday_yesterday);
			int16_t update_idx = stoptime_update->num_updates - 1;
			while (update_idx >= 0)
			{
				if (trip < 0)
				{
					break;
				}
				timeofday_t stop_time = input_data->stop_times[route->stop_time_idx + (trip * route->stop_count) + diva_route->stop_offset].departure_time;
				if (stop_time < ONE_DAY)
				{
					break;
				}
				int32_t trip_before = trip > 0 ? get_last_trip_in_service(input_data, route, trip - 1, date_yesterday, weekday_yesterday) : -1;
				timeofday_t stop_time_before = trip_before >= 0 ? input_data->stop_times[route->stop_time_idx + (trip_before * route->stop_count) + diva_route->stop_offset].departure_time : 0;
				timeofday_t time_real_yesterday = stoptime_update->time_real[update_idx] + ONE_DAY;
				if (trip_before != -1)
				{
					if (stop_time_before < time_real_yesterday)
					{
						if (stop_time < time_real_yesterday)
						{
							set_best_result(&best_results[update_idx], diva_route->route_id, trip, time_real_yesterday - stop_time);
						}
						else
						{
							trip_offset_t closer_trip = get_closer_trip(trip_before, trip, stop_time_before, stop_time, time_real_yesterday);
							set_best_result(&best_results[update_idx], diva_route->route_id, closer_trip.trip, closer_trip.realtime_offset);
						}
						update_idx--;
					}
					else
					{
						trip = trip_before;
					}
				}
				else
				{
					set_best_result(&best_results[update_idx], diva_route->route_id, trip, time_real_yesterday - stop_time);
					break;
				}
			}
			// check today
			trip = get_next_trip_in_service(input_data, route, 0, stoptime_update->date, stoptime_update->weekday);
			update_idx = 0;
			while (update_idx < stoptime_update->num_updates)
			{
				if (trip < 0)
				{
					break;
				}
				timeofday_t stop_time = input_data->stop_times[route->stop_time_idx + (trip * route->stop_count) + diva_route->stop_offset].departure_time;
				int32_t next_trip = trip < route->trip_count - 1 ? get_next_trip_in_service(input_data, route, trip + 1, stoptime_update->date, stoptime_update->weekday) : -1;
				timeofday_t next_stop_time = next_trip >= 0 ? input_data->stop_times[route->stop_time_idx + (next_trip * route->stop_count) + diva_route->stop_offset].departure_time : 0;
				timeofday_t time_real_today = stoptime_update->time_real[update_idx];
				if (next_trip != -1)
				{
					if (next_stop_time > time_real_today)
					{
						if (stop_time > time_real_today)
						{
							set_best_result(&best_results[update_idx], diva_route->route_id, trip, stop_time - time_real_today);
						}
						else
						{
							trip_offset_t closer_trip = get_closer_trip(trip, next_trip, stop_time, next_stop_time, time_real_today);
							set_best_result(&best_results[update_idx], diva_route->route_id, closer_trip.trip, closer_trip.realtime_offset);
						}
						update_idx++;
					}
					else
					{
						trip = next_trip;
					}
				}
				else
				{
					set_best_result(&best_results[update_idx], diva_route->route_id, trip, stop_time - time_real_today);
					break;
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
