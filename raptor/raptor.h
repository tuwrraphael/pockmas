#ifndef RAPTOR_H
#define RAPTOR_H
#include <stdint.h>

#define MAX_INTERCHANGES (16)

typedef uint8_t boolean_t;
#define TRUE (1)
#define FALSE (0)

typedef uint32_t timeofday_t;
typedef uint32_t datetime_t;

typedef uint16_t stop_id_t;
typedef uint16_t route_id_t;
typedef uint32_t weekdays_t;

typedef struct
{
	uint32_t stop_time_idx;
	uint32_t stop_idx;
	uint32_t stop_count;
	uint32_t trip_count;
	uint32_t calendar_idx;
} route_t;

typedef struct
{
	timeofday_t departure_time;
	timeofday_t arrival_time;
} stop_time_t;

typedef struct
{
	stop_id_t stop_id;
} route_stop_t;

typedef struct
{
	route_id_t route_id;
} stop_serving_route_t;

typedef struct
{
	uint16_t serving_routes_idx;
	uint16_t serving_routes_count;
	uint16_t transfers_idx;
	uint16_t transfers_count;
} stop_t;

typedef struct {
	stop_id_t to;
	uint16_t walking_time;
} transfer_t;

typedef struct {
	datetime_t start;
	datetime_t end;
	weekdays_t weekdays;
} calendar_t;

typedef struct {
	uint16_t calendar_id;
} trip_calendar_t;

typedef struct
{
	route_stop_t* route_stops;
	stop_time_t* stop_times;
	route_t* routes;
	stop_t* stops;
	uint16_t route_count;
	uint16_t stop_count_total;
	stop_serving_route_t* stop_serving_routes;
	transfer_t* transfers;
	calendar_t* calendars;
	trip_calendar_t* trip_calendars;
} input_data_t;

typedef struct
{
	boolean_t set;
	stop_id_t stop_id;
} queue_t;

typedef enum {
	BACKTRACKING_NONE = 0,
	BACKTRACKING_TRANSFER = 1,
	BACKTRACKING_ROUTE = 2
} backtracking_type_t;

typedef struct {
	route_id_t route;
	uint32_t trip;
	uint32_t route_stopindex;
	stop_id_t origin_stop;
	backtracking_type_t type;
} backtracking_t;

typedef uint32_t leg_type_t;

#define LEG_TYPE_WALKING (0)
#define LEG_TYPE_TRANSIT (1)

#define MAX_LEGS (10)
#define MAX_ITINERARYS (8)

typedef struct {
	leg_type_t type;
	stop_id_t origin_stop;
	stop_id_t destination_stop;
	timeofday_t departure;
	timeofday_t arrival;
	route_id_t route;
	uint32_t trip;
} leg_t;

typedef struct {
	uint32_t num_legs;
	leg_t legs[MAX_LEGS];
} itinerary_t;

typedef struct {
	uint32_t num_itineraries;
	itinerary_t itineraries[MAX_ITINERARYS];
} results_t;

typedef uint8_t marking_t;

#define MARKED (1)
#define UNMARKED (0)


#define TIME_INFINITY (INT32_MAX)


#ifdef __cplusplus
extern "C" {
#endif
	stop_time_t* get_stoptimes_memory(uint32_t number_of_stoptimes);

	route_t* get_routes_memory(uint16_t number_of_routes);

	route_stop_t* get_route_stops_memory(uint32_t number_of_route_stops);

	stop_serving_route_t* get_serving_routes_memory(uint32_t number_of_stop_routes);

	stop_t* get_stops_memory(uint16_t number_of_stops);

	transfer_t* get_transfers_memory(uint32_t number_of_transfers);

	calendar_t* get_calendars_memory(uint16_t number_of_calendars);

	trip_calendar_t* get_trip_calendars_memory(uint32_t number_of_trip_calendars);

	results_t* raptor(datetime_t depaturedate, uint8_t weekday, timeofday_t departure_time, stop_id_t start, stop_id_t target);

#ifdef __cplusplus
}
#endif

#endif