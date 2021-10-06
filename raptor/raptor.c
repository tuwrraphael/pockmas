#include "raptor.h"

static input_data_t input_data;

stop_time_t* get_stoptimes_memory(uint32_t number_of_stoptimes)
{
	input_data.stop_times = malloc(sizeof(stop_time_t) * number_of_stoptimes);
	return input_data.stop_times;
}

route_t* get_routes_memory(uint16_t number_of_routes)
{
	input_data.routes = malloc(sizeof(route_t) * number_of_routes);
	input_data.route_count = number_of_routes;
	return input_data.routes;
}

route_stop_t* get_route_stops_memory(uint32_t number_of_route_stops)
{
	input_data.route_stops = malloc(sizeof(route_stop_t) * number_of_route_stops);
	return input_data.route_stops;
}

stop_serving_route_t* get_serving_routes_memory(uint32_t number_of_stop_routes)
{
	input_data.stop_serving_routes = malloc(sizeof(stop_serving_route_t) * number_of_stop_routes);
	return input_data.stop_serving_routes;
}

transfer_t* get_transfers_memory(uint32_t number_of_transfers)
{
	input_data.transfers = malloc(sizeof(transfer_t) * number_of_transfers);
	return input_data.transfers;
}

stop_t* get_stops_memory(uint16_t number_of_stops)
{
	input_data.stop_count_total = number_of_stops;
	input_data.stops = malloc(sizeof(stop_t) * number_of_stops);
	return input_data.stops;
}

calendar_t* get_calendars_memory(uint16_t number_of_calendars)
{
	input_data.calendars = malloc(sizeof(calendar_t) * number_of_calendars);
	return input_data.calendars;
}

trip_calendar_t* get_trip_calendars_memory(uint32_t number_of_trip_calendars)
{
	input_data.trip_calendars = malloc(sizeof(trip_calendar_t) * number_of_trip_calendars);
	return input_data.trip_calendars;
}

static boolean_t is_before(stop_id_t stop_a, stop_id_t stop_b, route_id_t route_id)
{
	route_t* route = &input_data.routes[route_id];
	for (uint32_t i = route->stop_idx; i < route->stop_idx + route->stop_count; i++)
	{
		if (input_data.route_stops[i].stop_id == stop_a)
		{
			return TRUE;
		}
		if (input_data.route_stops[i].stop_id == stop_b)
		{
			return FALSE;
		}
	}
	return FALSE;
}

static timeofday_t min_time(timeofday_t a, timeofday_t b)
{
	return a < b ? a : b;
}


int32_t earliest_trip(route_id_t route_id, uint32_t stop_index, timeofday_t after, datetime_t date, uint8_t weekday)
{
	int earliest_trip = 0;
	route_t* route = &input_data.routes[route_id];
	for (uint32_t i = route->stop_time_idx + stop_index; i < route->stop_time_idx + stop_index + route->trip_count * route->stop_count; i += route->stop_count)
	{
		calendar_t *trip_calendar = &input_data.calendars[input_data.trip_calendars[route->calendar_idx + earliest_trip].calendar_id];
		if (date >= trip_calendar->start && date < trip_calendar->end && (weekday & trip_calendar->weekdays) > 0) {
			stop_time_t* stop_time = &input_data.stop_times[i];
			if (stop_time->departure_time > after)
			{
				return earliest_trip;
			}
		}
		earliest_trip++;
	}
	return -1;
}

#define INFINITY (INT32_MAX)

unsigned int raptor(datetime_t depaturedate, uint8_t weekday, timeofday_t departure_time, stop_id_t start, stop_id_t target)
{
	timeofday_t* earliest_known_arrival_times = malloc(sizeof(timeofday_t) * input_data.stop_count_total);
	marking_t* marking = malloc(sizeof(timeofday_t) * input_data.stop_count_total);
	queue_t* queue = malloc(sizeof(queue_t) * input_data.route_count);
	timeofday_t* earliest_known_arrival_times_with_trips[MAX_INTERCHANGES + 1];
	backtracking_t* backtracking[MAX_INTERCHANGES + 1];
	earliest_known_arrival_times_with_trips[0] = malloc(sizeof(timeofday_t) * input_data.stop_count_total);
	backtracking[0] = malloc(sizeof(backtracking_t) * input_data.stop_count_total);
	for (uint16_t i = 0; i < input_data.stop_count_total; i++)
	{
		backtracking[0][i].type = BACKTRACKING_NONE;
		earliest_known_arrival_times[i] = TIME_INFINITY;
		earliest_known_arrival_times_with_trips[0][i] = TIME_INFINITY;
		marking[i] = UNMARKED;
	}
	marking[start] = MARKED;
	earliest_known_arrival_times_with_trips[0][start] = departure_time;

	uint8_t round = 0;
	while (round < MAX_INTERCHANGES)
	{
		round++;
		backtracking[round] = malloc(sizeof(backtracking_t) * input_data.stop_count_total);
		earliest_known_arrival_times_with_trips[round] = malloc(sizeof(timeofday_t) * input_data.stop_count_total);
		for (uint16_t i = 0; i < input_data.stop_count_total; i++)
		{
			backtracking[round][i].type = BACKTRACKING_NONE;
			earliest_known_arrival_times_with_trips[round][i] = TIME_INFINITY;
		}
		for (uint16_t i = 0; i < input_data.route_count; i++)
		{
			queue[i].set = FALSE;
		}

		for (uint16_t stop_id = 0; stop_id < input_data.stop_count_total; stop_id++)
		{
			if (marking[stop_id] == UNMARKED)
			{
				continue;
			}
			stop_t* stop = &input_data.stops[stop_id];
			// for each route serving this stop
			for (uint32_t j = stop->serving_routes_idx; j < stop->serving_routes_count + stop->serving_routes_idx; j++)
			{
				route_id_t route_id = input_data.stop_serving_routes[j].route_id;
				if (queue[route_id].set == TRUE)
				{
					if (is_before(stop_id, queue[route_id].stop_id, route_id)) {
						queue[route_id].stop_id = stop_id;
					}
				}
				else
				{
					queue[route_id].set = TRUE;
					queue[route_id].stop_id = stop_id;
				}
			}
			marking[stop_id] = UNMARKED;
		}

		for (uint16_t i = 0; i < input_data.route_count; i++)
		{
			if (queue[i].set == FALSE)
			{
				continue;
			}
			route_t* route = &input_data.routes[i];
			stop_id_t stop_id = queue[i].stop_id;
			uint32_t start_index;
			for (start_index = route->stop_idx; start_index < route->stop_idx + route->stop_count; start_index++)
			{
				if (stop_id == input_data.route_stops[start_index].stop_id)
				{
					break;
				}
			}
			int32_t current_trip = -1;
			stop_id_t boarded_at;
			for (uint32_t j = 0; j < route->stop_count; j++)
			{
				stop_id_t current_stop_id = input_data.route_stops[route->stop_idx + j].stop_id;
				if (current_trip > -1)
				{
					stop_time_t* current_stoptime = &input_data.stop_times[route->stop_time_idx + j + current_trip * route->stop_count];
					timeofday_t arrival_at_j = current_stoptime->arrival_time;
					if (arrival_at_j < min_time(earliest_known_arrival_times[current_stop_id], earliest_known_arrival_times[target]))
					{
						earliest_known_arrival_times_with_trips[round][current_stop_id] = arrival_at_j;
						earliest_known_arrival_times[current_stop_id] = arrival_at_j;
						backtracking_t* currentStopTracking = &backtracking[round][current_stop_id];
						currentStopTracking->type = BACKTRACKING_ROUTE;
						currentStopTracking->route = i;
						currentStopTracking->trip = current_trip;
						currentStopTracking->origin_stop = boarded_at;
						marking[current_stop_id] = MARKED;
					}
					if (earliest_known_arrival_times_with_trips[round - 1][current_stop_id] < current_stoptime->departure_time)
					{
						current_trip = earliest_trip(i, j, earliest_known_arrival_times_with_trips[round - 1][current_stop_id], depaturedate, weekday);
						if (current_trip > -1) {
							boarded_at = current_stop_id;
						}
					}
				}
				else if (earliest_known_arrival_times_with_trips[round - 1][current_stop_id] != TIME_INFINITY) {
					current_trip = earliest_trip(i, j, earliest_known_arrival_times_with_trips[round - 1][current_stop_id], depaturedate, weekday);
					if (current_trip > -1) {
						boarded_at = current_stop_id;
					}
				}

			}
		}

		for (uint16_t stop_id = 0; stop_id < input_data.stop_count_total; stop_id++)
		{
			if (marking[stop_id] == UNMARKED)
			{
				continue;
			}
			stop_t* stop = &input_data.stops[stop_id];
			for (uint32_t transferIndex = stop->transfers_idx; transferIndex < stop->transfers_idx + stop->transfers_count; transferIndex++) {
				transfer_t* transfer = &input_data.transfers[transferIndex];
				timeofday_t arrivalWithTransfer = earliest_known_arrival_times_with_trips[round][stop_id] + transfer->walking_time;
				if (arrivalWithTransfer < earliest_known_arrival_times[transfer->to]) {
					earliest_known_arrival_times[transfer->to] = arrivalWithTransfer;
					earliest_known_arrival_times_with_trips[round][transfer->to] = arrivalWithTransfer;
					backtracking_t* transferTracking = &backtracking[round][transfer->to];
					transferTracking->type = BACKTRACKING_TRANSFER;
					transferTracking->origin_stop = stop_id;
					marking[transfer->to] = MARKED;
				}
			}
		}

		boolean_t marked = FALSE;
		for (uint16_t i = 0; i < input_data.stop_count_total; i++)
		{
			if (marking[i] == MARKED)
			{
				marked = TRUE;
				break;
			}
		}
		if (marked == FALSE)
		{
			break;
		}
	}

	return 0;
}