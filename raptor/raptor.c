#include "raptor.h"
#include "bump_allocator.h"

static input_data_t input_data;
static results_t *results = NULL;
static request_t *request = NULL;

stop_time_t *get_stoptimes_memory(uint32_t number_of_stoptimes)
{
	input_data.stop_times = malloc(sizeof(stop_time_t) * number_of_stoptimes);
	return input_data.stop_times;
}

route_t *get_routes_memory(uint16_t number_of_routes)
{
	input_data.routes = malloc(sizeof(route_t) * number_of_routes);
	input_data.route_count = number_of_routes;
	return input_data.routes;
}

route_stop_t *get_route_stops_memory(uint32_t number_of_route_stops)
{
	input_data.route_stops = malloc(sizeof(route_stop_t) * number_of_route_stops);
	return input_data.route_stops;
}

stop_serving_route_t *get_serving_routes_memory(uint32_t number_of_stop_routes)
{
	input_data.stop_serving_routes = malloc(sizeof(stop_serving_route_t) * number_of_stop_routes);
	return input_data.stop_serving_routes;
}

transfer_t *get_transfers_memory(uint32_t number_of_transfers)
{
	input_data.transfers = malloc(sizeof(transfer_t) * number_of_transfers);
	return input_data.transfers;
}

stop_t *get_stops_memory(uint16_t number_of_stops)
{
	input_data.stop_count_total = number_of_stops;
	input_data.stops = malloc(sizeof(stop_t) * number_of_stops);
	return input_data.stops;
}

calendar_t *get_calendars_memory(uint16_t number_of_calendars)
{
	input_data.calendars = malloc(sizeof(calendar_t) * number_of_calendars);
	return input_data.calendars;
}

trip_calendar_t *get_trip_calendars_memory(uint32_t number_of_trip_calendars)
{
	input_data.trip_calendars = malloc(sizeof(trip_calendar_t) * number_of_trip_calendars);
	return input_data.trip_calendars;
}

static boolean_t is_before(stop_id_t stop_a, stop_id_t stop_b, route_id_t route_id)
{
	route_t *route = &input_data.routes[route_id];
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
	route_t *route = &input_data.routes[route_id];
	for (uint32_t i = route->stop_time_idx + stop_index; i < route->stop_time_idx + stop_index + route->trip_count * route->stop_count; i += route->stop_count)
	{
		calendar_t *trip_calendar = &input_data.calendars[input_data.trip_calendars[route->calendar_idx + earliest_trip].calendar_id];
		if (date >= trip_calendar->start && date < trip_calendar->end && (weekday & trip_calendar->weekdays) > 0)
		{
			stop_time_t *stop_time = &input_data.stop_times[i];
			if (stop_time->departure_time > after)
			{
				return earliest_trip;
			}
		}
		earliest_trip++;
	}
	return -1;
}

static boolean_t reconstruct_itinerary(stop_id_t target_stop, uint8_t round, backtracking_t *backtracking[], timeofday_t *arrival_times[], itinerary_t *itinerary)
{
	backtracking_t *backtracking_target = &backtracking[round][target_stop];
	if (backtracking_target->type == BACKTRACKING_TRANSFER)
	{
		leg_t *leg = &itinerary->legs[itinerary->num_legs];
		leg->origin_stop = backtracking_target->origin_stop;
		leg->destination_stop = target_stop;
		leg->arrival = arrival_times[round][target_stop];
		leg->departure = arrival_times[round][backtracking_target->origin_stop];
		leg->type = LEG_TYPE_WALKING;
		itinerary->num_legs++;
		return reconstruct_itinerary(backtracking_target->origin_stop, round, backtracking, arrival_times, itinerary);
	}
	else if (backtracking_target->type == BACKTRACKING_ROUTE)
	{
		route_t *route = &input_data.routes[backtracking_target->route];
		leg_t *leg = &itinerary->legs[itinerary->num_legs];
		leg->origin_stop = backtracking_target->origin_stop;
		leg->destination_stop = target_stop;
		leg->arrival = arrival_times[round][target_stop];
		leg->departure = input_data.stop_times[route->stop_time_idx + route->stop_count * backtracking_target->trip + backtracking_target->route_stopindex].departure_time;
		leg->route = backtracking_target->route;
		leg->trip = backtracking_target->trip;
		leg->type = LEG_TYPE_TRANSIT;
		itinerary->num_legs++;
		if (round > 1)
		{
			return reconstruct_itinerary(backtracking_target->origin_stop, round - 1, backtracking, arrival_times, itinerary);
		}
		else
		{
			return TRUE;
		}
	}
	// BACKTRACKING_NONE
	else
	{
		return FALSE;
	}
}

static void collect_results(uint8_t rounds, backtracking_t *backtracking[], timeofday_t *arrival_times[], stop_id_t target, results_t *results)
{
	results->num_itineraries = 0;
	for (uint8_t i = 0; i < MAX_ITINERARYS; i++)
	{
		results->itineraries[i].num_legs = 0;
	}
	for (int8_t i = rounds; i >= 0; i--)
	{
		itinerary_t *currentItinerary = &results->itineraries[results->num_itineraries];
		boolean_t reconstruction_success = reconstruct_itinerary(target, i, backtracking, arrival_times, currentItinerary);
		if (reconstruction_success)
		{
			results->num_itineraries++;
		}
	}
}

request_t *get_request_memory()
{
	if (request == NULL)
	{
		request = malloc(sizeof(request_t));
	}
	return request;
}

results_t *raptor()
{
	if (results == NULL)
	{
		results = malloc(sizeof(results_t));
	}
	create_savepoint();
	timeofday_t *earliest_known_arrival_times = malloc(sizeof(timeofday_t) * input_data.stop_count_total);
	marking_t *marking = malloc(sizeof(timeofday_t) * input_data.stop_count_total);
	queue_t *queue = malloc(sizeof(queue_t) * input_data.route_count);
	timeofday_t *earliest_known_arrival_times_with_trips[MAX_INTERCHANGES + 1];
	backtracking_t *backtracking[MAX_INTERCHANGES + 1];
	earliest_known_arrival_times_with_trips[0] = malloc(sizeof(timeofday_t) * input_data.stop_count_total);
	backtracking[0] = malloc(sizeof(backtracking_t) * input_data.stop_count_total);
	for (uint16_t i = 0; i < input_data.stop_count_total; i++)
	{
		backtracking[0][i].type = BACKTRACKING_NONE;
		earliest_known_arrival_times[i] = TIME_INFINITY;
		earliest_known_arrival_times_with_trips[0][i] = TIME_INFINITY;
		marking[i] = UNMARKED;
	}
	for (uint8_t i = 0; i < request->num_departure_stations; i++)
	{
		marking[request->departure_stations[i]] = MARKED;
		earliest_known_arrival_times_with_trips[0][request->departure_stations[i]] = request->times[i];
	}

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
			stop_t *stop = &input_data.stops[stop_id];
			// for each route serving this stop
			for (uint16_t j = stop->serving_routes_idx; j < stop->serving_routes_count + stop->serving_routes_idx; j++)
			{
				route_id_t route_id = input_data.stop_serving_routes[j].route_id;
				if (queue[route_id].set == TRUE)
				{
					if (is_before(stop_id, queue[route_id].stop_id, route_id))
					{
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
			route_t *route = &input_data.routes[i];
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
			uint32_t boarded_at_idx;
			for (uint32_t j = 0; j < route->stop_count; j++)
			{
				stop_id_t current_stop_id = input_data.route_stops[route->stop_idx + j].stop_id;
				if (current_trip > -1)
				{
					stop_time_t *current_stoptime = &input_data.stop_times[route->stop_time_idx + j + current_trip * route->stop_count];
					timeofday_t arrival_at_j = current_stoptime->arrival_time;
					if (arrival_at_j < min_time(earliest_known_arrival_times[current_stop_id], earliest_known_arrival_times[request->arrival_stations[0]]))
					{
						earliest_known_arrival_times_with_trips[round][current_stop_id] = arrival_at_j;
						earliest_known_arrival_times[current_stop_id] = arrival_at_j;
						backtracking_t *currentStopTracking = &backtracking[round][current_stop_id];
						currentStopTracking->type = BACKTRACKING_ROUTE;
						currentStopTracking->route = i;
						currentStopTracking->trip = current_trip;
						currentStopTracking->origin_stop = boarded_at;
						currentStopTracking->route_stopindex = boarded_at_idx;
						marking[current_stop_id] = MARKED;
					}
					if (earliest_known_arrival_times_with_trips[round - 1][current_stop_id] < current_stoptime->departure_time)
					{
						current_trip = earliest_trip(i, j, earliest_known_arrival_times_with_trips[round - 1][current_stop_id], request->date, request->weekday);
						if (current_trip > -1)
						{
							boarded_at = current_stop_id;
							boarded_at_idx = j;
						}
					}
				}
				else if (earliest_known_arrival_times_with_trips[round - 1][current_stop_id] != TIME_INFINITY)
				{
					current_trip = earliest_trip(i, j, earliest_known_arrival_times_with_trips[round - 1][current_stop_id], request->date, request->weekday);
					if (current_trip > -1)
					{
						boarded_at = current_stop_id;
						boarded_at_idx = j;
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
			stop_t *stop = &input_data.stops[stop_id];
			for (uint16_t transferIndex = stop->transfers_idx; transferIndex < stop->transfers_idx + stop->transfers_count; transferIndex++)
			{
				transfer_t *transfer = &input_data.transfers[transferIndex];
				timeofday_t arrivalWithTransfer = earliest_known_arrival_times_with_trips[round][stop_id] + transfer->walking_time;
				if (arrivalWithTransfer < earliest_known_arrival_times[transfer->to])
				{
					earliest_known_arrival_times[transfer->to] = arrivalWithTransfer;
					earliest_known_arrival_times_with_trips[round][transfer->to] = arrivalWithTransfer;
					backtracking_t *transferTracking = &backtracking[round][transfer->to];
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
	collect_results(round, backtracking, earliest_known_arrival_times_with_trips, request->arrival_stations[0], results);
	reset_to_savepoint();
	return results;
}