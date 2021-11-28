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

typedef struct
{
	route_t *route;
	diva_route_t *diva_route;
	int32_t current_trip;
	timeofday_t current_trip_time;
} route_scan_state_t;

typedef struct
{
	int32_t trip;
	route_id_t route_id;
	timeofday_t stop_time;
	int32_t trip_before;
	timeofday_t stoptime_before;
} stoptime_before_t;

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

static void set_best_result(best_result_t *best_result, route_id_t route_id, uint16_t trip, int32_t realtime_offset, boolean_t last_trip)
{
	if (best_result->set == FALSE || abs(realtime_offset) < abs(best_result->realtime_offset))
	{
		best_result->route_id = route_id;
		best_result->trip = trip;
		best_result->realtime_offset = realtime_offset;
		best_result->set = TRUE;
		best_result->was_last_trip = last_trip;
	}
}

typedef struct
{
	boolean_t trip_a_closer;
	int32_t realtime_offset;
} trip_offset_t;

// a < real < b
static trip_offset_t get_closer_trip(timeofday_t stop_time_a, timeofday_t stop_time_b, timeofday_t time_real)
{
	trip_offset_t result;
	int32_t offset_a = time_real - stop_time_a;
	int32_t offset_b = stop_time_b - time_real;
	// a is late
	if (offset_a < offset_b)
	{
		result.trip_a_closer = TRUE;
		result.realtime_offset = offset_a;
	}
	else
	{ // b is early
		result.trip_a_closer = FALSE;
		result.realtime_offset = -offset_b;
	}
	return result;
}

static int32_t get_next_route_to_step(route_scan_state_t *route_scan_state, uint16_t route_count)
{
	int32_t latest = -1;
	for (uint16_t i = 0; i < route_count; i++)
	{
		if (route_scan_state[i].current_trip != -1 && (latest == -1 || (route_scan_state[i].current_trip_time > route_scan_state[latest].current_trip_time)))
		{
			latest = i;
		}
	}
	return latest;
}

static stoptime_before_t get_stoptime_before(input_data_t *input_data, route_scan_state_t *route_scan_state, uint16_t route_count, uint16_t current,
											 datetime_t date, uint8_t weekday)
{
	stoptime_before_t result;
	int32_t second_latest = -1;
	for (uint16_t i = 0; i < route_count; i++)
	{
		if (current != i && route_scan_state[i].current_trip != -1 && (second_latest == -1 || (route_scan_state[i].current_trip_time > route_scan_state[second_latest].current_trip_time)))
		{
			second_latest = i;
		}
	}
	route_t *route = route_scan_state[current].route;
	diva_route_t *diva_route = route_scan_state[current].diva_route;
	uint16_t trip = route_scan_state[current].current_trip;
	result.trip_before = trip > 0 ? get_last_trip_in_service(input_data, route, trip - 1, date, weekday) : -1;
	result.stoptime_before = result.trip_before > 0 ? input_data->stop_times[route->stop_time_idx + (result.trip_before * route->stop_count) + diva_route->stop_offset].departure_time : 0;
	if (result.trip_before == -1 && second_latest == -1)
	{
		result.trip = -1;
	}
	else if (result.trip_before == -1 || (result.stoptime_before < route_scan_state[second_latest].current_trip_time))
	{
		result.trip = route_scan_state[second_latest].current_trip;
		result.route_id = route_scan_state[second_latest].diva_route->route_id;
		result.stop_time = route_scan_state[second_latest].current_trip_time;
	}
	else
	{
		result.trip = result.trip_before;
		result.route_id = route_scan_state[current].diva_route->route_id;
		result.stop_time = result.stoptime_before;
	}
	return result;
}

static void scan_routes(input_data_t *input_data, route_scan_state_t *route_scan_states, uint16_t matching_routes_count,
						datetime_t date, uint8_t weekday, boolean_t yesterday, best_result_t *best_results)
{
	for (uint16_t i = 0; i < matching_routes_count; i++)
	{
		route_t *route = route_scan_states[i].route;
		diva_route_t *diva_route = route_scan_states[i].diva_route;
		route_scan_states[i].current_trip = get_last_trip_in_service(input_data, route, route->trip_count - 1, date, weekday);
		route_scan_states[i].current_trip_time = route_scan_states[i].current_trip > -1 ? input_data->stop_times[route->stop_time_idx + (route_scan_states[i].current_trip * route->stop_count) + diva_route->stop_offset].departure_time : 0;
	}
	int16_t update_idx = stoptime_update->num_updates - 1;
	timeofday_t time_real = yesterday ? stoptime_update->time_real[update_idx] + ONE_DAY : stoptime_update->time_real[update_idx];
	while (update_idx >= 0)
	{

		int32_t next_route_to_step = get_next_route_to_step(route_scan_states, matching_routes_count);
		if (next_route_to_step < 0)
		{
			break;
		}
		if (yesterday && route_scan_states[next_route_to_step].current_trip_time < ONE_DAY)
		{
			break;
		}
		route_scan_state_t *route_scan_state = &route_scan_states[next_route_to_step];
		stoptime_before_t stoptime_before = get_stoptime_before(input_data, route_scan_states, matching_routes_count, next_route_to_step, date, weekday);
		if (stoptime_before.trip >= 0)
		{
			if (stoptime_before.stop_time < time_real)
			{
				if (route_scan_state->current_trip_time < time_real)
				{
					set_best_result(&best_results[update_idx], route_scan_state->diva_route->route_id, route_scan_state->current_trip, time_real - route_scan_state->current_trip_time, FALSE);
				}
				else
				{
					trip_offset_t closer_trip = get_closer_trip(stoptime_before.stop_time, route_scan_state->current_trip_time, time_real);
					if (closer_trip.trip_a_closer)
					{
						set_best_result(&best_results[update_idx], stoptime_before.route_id, stoptime_before.trip, closer_trip.realtime_offset, FALSE);
					}
					else
					{
						set_best_result(&best_results[update_idx], route_scan_state->diva_route->route_id, route_scan_state->current_trip, closer_trip.realtime_offset, FALSE);
					}
				}
				stoptime_update->num_matches[update_idx]++;
				update_idx--;
				time_real = yesterday ? stoptime_update->time_real[update_idx] + ONE_DAY : stoptime_update->time_real[update_idx];
			}
			route_scan_state->current_trip = stoptime_before.trip_before;
			route_scan_state->current_trip_time = stoptime_before.stoptime_before;
		}
		else
		{
			set_best_result(&best_results[update_idx], route_scan_state->diva_route->route_id, route_scan_state->current_trip, time_real - route_scan_state->current_trip_time, TRUE);
			break;
		}
	}
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
	create_savepoint();
	route_scan_state_t *route_scan_states = malloc(sizeof(route_scan_state_t) * diva_index_obj->diva_routes_count);
	uint16_t matching_routes_count = 0;
	for (uint16_t i = 0; i < diva_index_obj->diva_routes_count; i++)
	{
		diva_route_t *diva_route = &input_data->diva_routes[diva_index_obj->diva_routes_index + i];
		boolean_t matching = diva_route->linie_id == stoptime_update->linie && diva_route->direction == stoptime_update->direction;
		if (matching)
		{
			route_t *route = &input_data->routes[diva_route->route_id];
			route_scan_states[matching_routes_count].route = route;
			route_scan_states[matching_routes_count].diva_route = diva_route;
			matching_routes_count++;
		}
	}
	// check yesterday
	datetime_t date_yesterday = stoptime_update->date - ONE_DAY;
	uint8_t weekday_yesterday = weekday_before(stoptime_update->weekday);
	scan_routes(input_data, route_scan_states, matching_routes_count, date_yesterday, weekday_yesterday, TRUE, best_results);
	// check today
	scan_routes(input_data, route_scan_states, matching_routes_count, stoptime_update->date, stoptime_update->weekday, FALSE, best_results);
	reset_to_savepoint();
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
