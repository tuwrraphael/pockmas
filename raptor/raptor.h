#ifndef RAPTOR_H
#define RAPTOR_H
#include <stdint.h>
#include "input_data.h"
#include "boolean.h"

#define MAX_INTERCHANGES (11)
#define MAX_LEGS (MAX_INTERCHANGES - 1)
#define MAX_ITINERARYS (8)
#define MAX_REQUEST_STATIONS (20)
#define MAX_DEPARTURE_RESULTS (10)

typedef struct
{
	boolean_t set;
	stop_id_t stop_id;
} queue_t;

typedef enum
{
	BACKTRACKING_NONE = 0,
	BACKTRACKING_TRANSFER = 1,
	BACKTRACKING_ROUTE = 2
} backtracking_type_t;

typedef struct
{
	route_id_t route;
	uint32_t trip;
	uint32_t route_stopindex;
	stop_id_t origin_stop;
	backtracking_type_t type;
	datetime_t boarded_date;
} backtracking_t;

typedef uint32_t leg_type_t;

#define LEG_TYPE_WALKING (0)
#define LEG_TYPE_TRANSIT (1)

typedef struct
{
	leg_type_t type;
	stop_id_t origin_stop;
	stop_id_t destination_stop;
	datetime_t planned_departure;
	datetime_t arrival;
	route_id_t route;
	int16_t delay;
	uint32_t trip;
} leg_t;

typedef struct
{
	uint32_t num_legs;
	leg_t legs[MAX_LEGS];
} itinerary_t;

typedef struct
{
	uint32_t num_itineraries;
	itinerary_t itineraries[MAX_ITINERARYS];
} results_t;

typedef struct
{
	route_id_t route_id;
	stop_id_t stop_id;
	uint32_t trip;
	datetime_t planned_departure;
	int16_t delay;
	uint16_t padding;
} departure_result_t;

typedef struct
{
	uint32_t num_results;
	departure_result_t results[MAX_DEPARTURE_RESULTS];
} departure_results_t;

typedef uint8_t time_type_t;
#define TIME_TYPE_DEPARTURE (0)
#define TIME_TYPE_ARRIVAL (1)

typedef struct
{
	time_type_t type;
	uint8_t num_departure_stations;
	uint8_t num_arrival_stations;
	uint8_t weekday;
	stop_id_t departure_stations[MAX_REQUEST_STATIONS];
	stop_id_t arrival_stations[MAX_REQUEST_STATIONS];
	timeofday_t times[MAX_REQUEST_STATIONS];
	datetime_t date;
} request_t;

typedef struct 
{
	timeofday_t departure_time;
	timeofday_t arrival_time;
	int16_t delay;
	uint16_t padding;
} stoptime_lookup_result_t;


typedef uint8_t marking_t;

#define MARKED (1)
#define UNMARKED (0)

#ifdef __cplusplus
extern "C"
{
#endif

#ifndef WASM_BUILD

	realtime_route_index_t *get_realtime_route_index_memory(uint32_t number_of_realtime_route_identifiers);

	realtime_route_t *get_realtime_routes_memory(uint32_t number_of_realtime_routes);

	stop_time_t *get_stoptimes_memory(uint32_t number_of_stoptimes);

	route_t *get_routes_memory(uint16_t number_of_routes);

	route_stop_t *get_route_stops_memory(uint32_t number_of_route_stops);

	stop_serving_route_t *get_serving_routes_memory(uint32_t number_of_stop_routes);

	stop_t *get_stops_memory(uint16_t number_of_stops);

	transfer_t *get_transfers_memory(uint32_t number_of_transfers);

	calendar_t *get_calendars_memory(uint16_t number_of_calendars);

	calendar_exception_t *get_calendar_exceptions_memory(uint32_t number_of_calendar_exceptions);

	trip_calendar_t *get_trip_calendars_memory(uint32_t number_of_trip_calendars);

#define __attribute__(a)

#endif

	__attribute__((export_name("raptor_allocate"))) void *raptor_allocate(uint32_t number_of_stoptimes, uint16_t number_of_routes, uint32_t number_of_transfers,
																		  uint16_t number_of_stops, uint16_t number_of_calendars, uint32_t number_of_calendar_exceptions,
																		  uint32_t number_of_realtime_route_identifiers, uint32_t number_of_realtime_routes, uint32_t number_of_route_stops,
																		  uint32_t number_of_stop_routes, uint32_t number_of_trip_calendars);

	__attribute__((export_name("get_request_memory"))) request_t *get_request_memory();

	__attribute__((export_name("raptor"))) results_t *raptor();

	__attribute__((export_name("initialize"))) void initialize();

	__attribute__((export_name("process_realtime"))) void process_realtime();

	__attribute__((export_name("get_departures"))) departure_results_t *get_departures();

	__attribute__((export_name("get_stoptime"))) stoptime_lookup_result_t *get_stoptime(route_id_t route_id, stop_id_t stop_id, uint32_t trip);

	__attribute__((export_name("get_transfer_time"))) uint16_t get_transfer_time(stop_id_t stop_from, stop_id_t stop_to);

#ifdef __cplusplus
}
#endif

#endif