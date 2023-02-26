#include "realtime.h"
#include "bump_allocator.h"
#include "calendar_utils.h"
#include "schedule_scanner.h"

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
		input_data->realtime_index[route_id].min_delay = 0;
		input_data->realtime_index[route_id].max_delay = 0;
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

static void scan_routes(input_data_t *input_data, realtime_route_index_t *realtime_index_obj, datetime_t datetime, uint8_t weekday, best_result_t *best_results)
{
	schedule_scan_state_t *schedule_scan_state = schedule_scan_initialize(realtime_index_obj->realtime_routes_count, TRUE, stoptime_update->date - ONE_DAY, FALSE);
	date_t date = {
		.datetime = datetime,
		.weekday = weekday,
	};
	for (uint16_t i = 0; i < realtime_index_obj->realtime_routes_count; i++)
	{

		realtime_route_t *realtime_route = &input_data->realtime_routes[realtime_index_obj->realtime_routes_index + i];
		boolean_t matching = realtime_route->route_class == stoptime_update->route_class && realtime_route->headsign_variant == stoptime_update->headsign_variant;
		if (matching)
		{
			schedule_scan_add_route(input_data, schedule_scan_state, realtime_route->route_id, realtime_route->stop_offset, ADD_ROUTE_AT_LAST_TRIP, date);
		}
	}
	int16_t update_idx = stoptime_update->num_updates - 1;
	datetime_t time_real = stoptime_update->time_real[update_idx] + datetime;
	while (update_idx >= 0)
	{

		schedule_scan_result_t res = schedule_scan_advance(input_data, schedule_scan_state);
		if (res.end)
		{
			break;
		}

		if (res.next.trip >= 0)
		{
			if (res.next.departure.planned_departure < time_real)
			{
				if (res.current.departure.planned_departure < time_real)
				{
					set_best_result(&best_results[update_idx], res.current.route_id, res.current.trip, time_real - res.current.departure.planned_departure, FALSE);
				}
				else
				{
					trip_offset_t closer_trip = get_closer_trip(res.next.departure.planned_departure, res.current.departure.planned_departure, time_real);
					if (closer_trip.trip_a_closer)
					{
						set_best_result(&best_results[update_idx], res.next.route_id, res.next.trip, closer_trip.realtime_offset, FALSE);
					}
					else
					{
						set_best_result(&best_results[update_idx], res.current.route_id, res.current.trip, closer_trip.realtime_offset, FALSE);
					}
				}
				stoptime_update->num_matches[update_idx]++;
				update_idx--;
				time_real = stoptime_update->time_real[update_idx] + datetime;
			}
		}
		else
		{
			set_best_result(&best_results[update_idx], res.current.route_id, res.current.trip, time_real - res.current.departure.planned_departure, TRUE);
			break;
		}
	}
}

static void set_min_max_delay(input_data_t *input_data, route_id_t route_id, int16_t delay)
{
	if (delay < input_data->realtime_index[route_id].min_delay) {
		input_data->realtime_index[route_id].min_delay = delay;
	}
	if (delay > input_data->realtime_index[route_id].max_delay) {
		input_data->realtime_index[route_id].max_delay = delay;
	}
}

void process_stoptime_update(input_data_t *input_data)
{
	for (uint8_t i = 0; i < stoptime_update->num_updates; i++)
	{
		stoptime_update->num_matches[i] = 0;
	}
	uint16_t realtime_route_identifier_index;
	for (realtime_route_identifier_index = 0; realtime_route_identifier_index < input_data->realtime_route_identifiers_count; realtime_route_identifier_index++)
	{
		if (input_data->realtime_route_index[realtime_route_identifier_index].realtime_route_identifier == stoptime_update->realtime_route_identifier &&
			input_data->realtime_route_index[realtime_route_identifier_index].realtime_route_identifier_type == stoptime_update->realtime_route_identifier_type)
		{
			break;
		}
	}
	realtime_route_index_t *realtime_route_index_obj = &input_data->realtime_route_index[realtime_route_identifier_index];
	best_result_t best_results[MAX_STOPTIME_UPDATES];
	for (uint8_t i = 0; i < MAX_STOPTIME_UPDATES; i++)
	{
		best_results[i].set = FALSE;
		best_results[i].was_last_trip = FALSE;
	}
	create_savepoint();
	scan_routes(input_data, realtime_route_index_obj, stoptime_update->date, stoptime_update->weekday, best_results);
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
				int16_t delay = best_results[i].realtime_offset;
				input_data->realtime_offsets[input_data->realtime_index[best_results[i].route_id].realtime_index + best_results[i].trip] = delay;
				set_min_max_delay(input_data, best_results[i].route_id, delay);
			}
		}
	}
}

inline int16_t get_trip_delay(input_data_t *input_data, route_id_t route_id, uint16_t trip) {
	return input_data->realtime_offsets[input_data->realtime_index[route_id].realtime_index + trip];
}