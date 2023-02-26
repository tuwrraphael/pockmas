#include "raptor.h"
#include "bump_allocator.h"
#include "realtime.h"
#include "calendar_utils.h"
#include "catch_trip.h"
#include "schedule_scanner.h"

static input_data_t input_data;
static results_t *results = NULL;
static request_t *request = NULL;
static departure_results_t departure_results;
static stoptime_lookup_result_t stoptime_lookup_result;

void *raptor_allocate(uint32_t number_of_stoptimes, uint16_t number_of_routes, uint32_t number_of_transfers,
					  uint16_t number_of_stops, uint16_t number_of_calendars, uint32_t number_of_calendar_exceptions,
					  uint32_t number_of_realtime_route_identifiers, uint32_t number_of_realtime_routes, uint32_t number_of_route_stops,
					  uint32_t number_of_stop_routes, uint32_t number_of_trip_calendars)
{
	size_t number_of_bytes = sizeof(stop_time_t) * number_of_stoptimes +
							 sizeof(route_t) * number_of_routes +
							 sizeof(transfer_t) * number_of_transfers +
							 sizeof(stop_t) * number_of_stops +
							 sizeof(calendar_t) * number_of_calendars +
							 sizeof(calendar_exception_t) * number_of_calendar_exceptions +
							 sizeof(realtime_route_index_t) * number_of_realtime_route_identifiers +
							 sizeof(realtime_route_t) * number_of_realtime_routes +
							 sizeof(route_stop_t) * number_of_route_stops +
							 sizeof(stop_serving_route_t) * number_of_stop_routes +
							 sizeof(trip_calendar_t) * number_of_trip_calendars;

	unsigned char *memory = malloc(number_of_bytes);
	unsigned char *start = memory;

	input_data.stop_times = (void *)memory;
	memory += sizeof(stop_time_t) * number_of_stoptimes;

	input_data.routes = (void *)(memory);
	input_data.route_count = number_of_routes;
	memory += sizeof(route_t) * number_of_routes;

	input_data.transfers = (void *)(memory);
	memory += sizeof(transfer_t) * number_of_transfers;

	input_data.stops = (void *)(memory);
	input_data.stop_count_total = number_of_stops;
	memory += sizeof(stop_t) * number_of_stops;

	input_data.calendars = (void *)(memory);
	input_data.calendar_count = number_of_calendars;
	memory += sizeof(calendar_t) * number_of_calendars;

	input_data.calendar_exceptions = (void *)(memory);
	memory += sizeof(calendar_exception_t) * number_of_calendar_exceptions;

	input_data.realtime_route_index = (void *)(memory);
	input_data.realtime_route_identifiers_count = number_of_realtime_route_identifiers;
	memory += sizeof(realtime_route_index_t) * number_of_realtime_route_identifiers;

	input_data.realtime_routes = (void *)(memory);
	memory += sizeof(realtime_route_t) * number_of_realtime_routes;

	input_data.route_stops = (void *)(memory);
	memory += sizeof(route_stop_t) * number_of_route_stops;

	input_data.stop_serving_routes = (void *)(memory);
	memory += sizeof(stop_serving_route_t) * number_of_stop_routes;

	input_data.trip_calendars = (void *)(memory);
	return start;
}

#ifndef WASM_BUILD

stop_time_t *get_stoptimes_memory(uint32_t number_of_stoptimes)
{
	input_data.stop_times = malloc(sizeof(stop_time_t) * number_of_stoptimes);
	return input_data.stop_times;
}

realtime_route_index_t *get_realtime_route_index_memory(uint32_t number_of_realtime_route_identifiers)
{
	input_data.realtime_route_index = malloc(sizeof(realtime_route_index_t) * number_of_realtime_route_identifiers);
	input_data.realtime_route_identifiers_count = number_of_realtime_route_identifiers;
	return input_data.realtime_route_index;
}

realtime_route_t *get_realtime_routes_memory(uint32_t number_of_realtime_routes)
{
	input_data.realtime_routes = malloc(sizeof(realtime_route_t) * number_of_realtime_routes);
	return input_data.realtime_routes;
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
	input_data.calendar_count = number_of_calendars;
	return input_data.calendars;
}

calendar_exception_t *get_calendar_exceptions_memory(uint32_t number_of_calendar_exceptions)
{
	input_data.calendar_exceptions = malloc(sizeof(calendar_exception_t) * number_of_calendar_exceptions);
	return input_data.calendar_exceptions;
}

trip_calendar_t *get_trip_calendars_memory(uint32_t number_of_trip_calendars)
{
	input_data.trip_calendars = malloc(sizeof(trip_calendar_t) * number_of_trip_calendars);
	return input_data.trip_calendars;
}

#endif

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

static datetime_t min_time(datetime_t a, datetime_t b)
{
	return a < b ? a : b;
}

static datetime_t get_arrival_at_stop(route_id_t route_id, route_t *route, uint16_t trip, uint32_t stop_index, datetime_t boarding_date)
{
	stop_time_t *current_stoptime = &input_data.stop_times[route->stop_time_idx + stop_index + trip * route->stop_count];
	int16_t current_trip_delay = get_trip_delay(&input_data, route_id, trip);
	timeofday_t arrival_at_j = (current_stoptime->arrival_time + current_trip_delay);
	return boarding_date + arrival_at_j;
}

static datetime_t get_planned_departure_at_stop(route_t *route, uint16_t trip, uint32_t stop_index, datetime_t boarding_date)
{
	stop_time_t *current_stoptime = &input_data.stop_times[route->stop_time_idx + stop_index + trip * route->stop_count];
	timeofday_t arrival_at_j = current_stoptime->departure_time;
	return boarding_date + arrival_at_j;
}

static boolean_t reconstruct_itinerary(stop_id_t target_stop, uint8_t round, backtracking_t *backtracking[], datetime_t *arrival_times[], itinerary_t *itinerary)
{
	backtracking_t *backtracking_target = &backtracking[round][target_stop];
	if (itinerary->num_legs > MAX_LEGS - 1)
	{
		return FALSE;
	}
	if (backtracking_target->type == BACKTRACKING_TRANSFER)
	{
		leg_t *leg = &itinerary->legs[itinerary->num_legs];
		leg->origin_stop = backtracking_target->origin_stop;
		leg->destination_stop = target_stop;
		leg->arrival = arrival_times[round][target_stop];
		leg->planned_departure = arrival_times[round][backtracking_target->origin_stop];
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
		leg->planned_departure = get_planned_departure_at_stop(route, backtracking_target->trip, backtracking_target->route_stopindex, backtracking_target->boarded_date);
		leg->delay = get_trip_delay(&input_data, backtracking_target->route, backtracking_target->trip);
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

static void collect_results(uint8_t rounds, backtracking_t *backtracking[], datetime_t *arrival_times[], stop_id_t target, results_t *results)
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
	return request;
}

boolean_t initialized = FALSE;

void initialize()
{
	if (initialized == TRUE)
	{
		return;
	}
	initialized = TRUE;
	request = malloc(sizeof(request_t));
	results = malloc(sizeof(results_t));
	initialize_realtime_memory(&input_data);
	initialize_calendar_cache(input_data.calendar_count);
}

static uint32_t stop_index_in_route(route_t *route, stop_id_t stop_id)
{
	// can't binary search here, route_stops is not sorted by stop_id but by stop serving order of the route
	for (uint32_t i = 0; i < route->stop_count; i++)
	{
		if (stop_id == input_data.route_stops[route->stop_idx + i].stop_id)
		{
			return i;
		}
	}
	return 0;
}

departure_results_t *get_departures()
{
	departure_results.num_results = 0;
	create_savepoint();
	uint16_t num_routes_to_step = 0;
	for (uint8_t i = 0; i < request->num_departure_stations; i++)
	{
		stop_id_t stop_id = request->departure_stations[i];
		stop_t *stop = &input_data.stops[stop_id];
		num_routes_to_step += stop->serving_routes_count;
	}
	schedule_scan_state_t *state = schedule_scan_initialize(num_routes_to_step, FALSE, request->date + ONE_DAY, TRUE);
	for (uint8_t i = 0; i < request->num_departure_stations; i++)
	{
		stop_id_t stop_id = request->departure_stations[i];
		stop_t *stop = &input_data.stops[stop_id];
		for (uint32_t j = stop->serving_routes_idx; j < stop->serving_routes_count + stop->serving_routes_idx; j++)
		{
			stop_serving_route_t *stop_serving_route = &input_data.stop_serving_routes[j];
			route_t *route = &input_data.routes[stop_serving_route->route_id];
			uint32_t stop_index = stop_index_in_route(route, stop_id);
			caught_trip_t e = catch_trip(&input_data, stop_serving_route->route_id, stop_index, request->date + request->times[i], request->date, request->weekday);
			if (e.trip > -1)
			{
				date_t trip_date = find_date(e.boarded_date, request->date, request->weekday);
				schedule_scan_add_route(&input_data, state, stop_serving_route->route_id, stop_index, e.trip, trip_date);
			}
		}
	}
	schedule_scan_result_t res = schedule_scan_advance(&input_data, state);
	while (departure_results.num_results < MAX_DEPARTURE_RESULTS && !res.end)
	{
		route_t *route = &input_data.routes[res.current.route_id];
		boolean_t is_last_stop = res.current.stop_offset == route->stop_count - 1;
		if (is_last_stop)
		{
			res = schedule_scan_advance(&input_data, state);
			continue;
		}
		stop_id_t stop_id = input_data.route_stops[route->stop_idx + res.current.stop_offset].stop_id;
		departure_results.results[departure_results.num_results].delay = res.current.departure.delay;
		departure_results.results[departure_results.num_results].stop_id = stop_id;
		departure_results.results[departure_results.num_results].planned_departure = res.current.departure.planned_departure;
		departure_results.results[departure_results.num_results].route_id = res.current.route_id;
		departure_results.results[departure_results.num_results].trip = res.current.trip;
		departure_results.num_results++;
		res = schedule_scan_advance(&input_data, state);
	}
	reset_to_savepoint();
	return &departure_results;
}

stoptime_lookup_result_t *get_stoptime(route_id_t route_id, stop_id_t stop_id, uint32_t trip)
{
	route_t *route = &input_data.routes[route_id];
	uint32_t stop_index = stop_index_in_route(route, stop_id);
	stop_time_t *stop_time = &input_data.stop_times[route->stop_time_idx + (trip * route->stop_count) + stop_index];
	stoptime_lookup_result.departure_time = stop_time->departure_time;
	stoptime_lookup_result.arrival_time = stop_time->arrival_time;
	stoptime_lookup_result.delay = get_trip_delay(&input_data, route_id, trip);
	return &stoptime_lookup_result;
}

uint16_t get_transfer_time(stop_id_t stop_from_id, stop_id_t stop_to_id)
{
	stop_t *stop = &input_data.stops[stop_from_id];
	for (uint32_t transferIndex = stop->transfers_idx; transferIndex < stop->transfers_idx + stop->transfers_count; transferIndex++)
	{
		transfer_t *transfer = &input_data.transfers[transferIndex];
		if (transfer->to == stop_to_id)
		{
			return transfer->walking_time;
		}
	}
	return 0;
}

results_t *raptor()
{
	create_savepoint();
	datetime_t *earliest_known_arrival_times = malloc(sizeof(datetime_t) * input_data.stop_count_total);
	marking_t *marking = malloc(sizeof(timeofday_t) * input_data.stop_count_total);
	queue_t *queue = malloc(sizeof(queue_t) * input_data.route_count);
	datetime_t *earliest_known_arrival_times_with_trips[MAX_INTERCHANGES + 1];
	backtracking_t *backtracking[MAX_INTERCHANGES + 1];
	earliest_known_arrival_times_with_trips[0] = malloc(sizeof(datetime_t) * input_data.stop_count_total);
	backtracking[0] = malloc(sizeof(backtracking_t) * input_data.stop_count_total);
	for (uint16_t i = 0; i < input_data.stop_count_total; i++)
	{
		backtracking[0][i].type = BACKTRACKING_NONE;
		earliest_known_arrival_times[i] = DATETIME_INFINITY;
		earliest_known_arrival_times_with_trips[0][i] = DATETIME_INFINITY;
		marking[i] = UNMARKED;
	}
	for (uint8_t i = 0; i < request->num_departure_stations; i++)
	{
		marking[request->departure_stations[i]] = MARKED;
		earliest_known_arrival_times_with_trips[0][request->departure_stations[i]] = request->date + request->times[i];
	}

	uint8_t round = 0;
	while (round < MAX_INTERCHANGES)
	{
		round++;
		backtracking[round] = malloc(sizeof(backtracking_t) * input_data.stop_count_total);
		earliest_known_arrival_times_with_trips[round] = malloc(sizeof(datetime_t) * input_data.stop_count_total);
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
			for (uint32_t j = stop->serving_routes_idx; j < stop->serving_routes_count + stop->serving_routes_idx; j++)
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
			uint32_t start_index = stop_index_in_route(route, stop_id);
			caught_trip_t current_trip;
			current_trip.trip = -1;
			stop_id_t boarded_at;
			int32_t wait_time_at_boarding_stop;
			uint32_t boarded_at_idx;
			for (uint32_t j = start_index; j < route->stop_count; j++)
			{
				stop_id_t current_stop_id = input_data.route_stops[route->stop_idx + j].stop_id;
				if (current_trip.trip > -1)
				{
					datetime_t arrival_at_j = get_arrival_at_stop(i, route, current_trip.trip, j, current_trip.boarded_date);
					if (arrival_at_j < min_time(earliest_known_arrival_times[current_stop_id], earliest_known_arrival_times[request->arrival_stations[0]]))
					{
						earliest_known_arrival_times_with_trips[round][current_stop_id] = arrival_at_j;
						earliest_known_arrival_times[current_stop_id] = arrival_at_j;
						backtracking_t *currentStopTracking = &backtracking[round][current_stop_id];
						currentStopTracking->type = BACKTRACKING_ROUTE;
						currentStopTracking->route = i;
						currentStopTracking->trip = current_trip.trip;
						currentStopTracking->origin_stop = boarded_at;
						currentStopTracking->route_stopindex = boarded_at_idx;
						currentStopTracking->boarded_date = current_trip.boarded_date;
						marking[current_stop_id] = MARKED;
					}
					if (earliest_known_arrival_times_with_trips[round - 1][current_stop_id] < (arrival_at_j))
					{
						caught_trip_t new_trip = catch_trip(&input_data, i, j, earliest_known_arrival_times_with_trips[round - 1][current_stop_id], request->date, request->weekday);

						if (current_trip.trip > -1)
						{
							boolean_t is_new_trip = new_trip.trip != current_trip.trip || new_trip.boarded_date != current_trip.boarded_date;
							// if we are already hopped on this trip earlier
							// prefer boarding at maximized wait time
							boolean_t prefer_boarding = !is_new_trip && wait_time_at_boarding_stop < new_trip.departure - earliest_known_arrival_times_with_trips[round - 1][current_stop_id];
							if (is_new_trip || prefer_boarding)
							{
								current_trip = new_trip;
								boarded_at = current_stop_id;
								boarded_at_idx = j;
								wait_time_at_boarding_stop = current_trip.departure - earliest_known_arrival_times_with_trips[round - 1][current_stop_id];
							}
						}
					}
				}
				else if (earliest_known_arrival_times_with_trips[round - 1][current_stop_id] != TIME_INFINITY)
				{
					current_trip = catch_trip(&input_data, i, j, earliest_known_arrival_times_with_trips[round - 1][current_stop_id], request->date, request->weekday);
					if (current_trip.trip > -1)
					{
						boarded_at = current_stop_id;
						boarded_at_idx = j;
						wait_time_at_boarding_stop = current_trip.departure - earliest_known_arrival_times_with_trips[round - 1][current_stop_id];
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
			for (uint32_t transferIndex = stop->transfers_idx; transferIndex < stop->transfers_idx + stop->transfers_count; transferIndex++)
			{
				transfer_t *transfer = &input_data.transfers[transferIndex];
				datetime_t arrivalWithTransfer = earliest_known_arrival_times_with_trips[round][stop_id] + transfer->walking_time;
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

void process_realtime()
{
	process_stoptime_update(&input_data);
}