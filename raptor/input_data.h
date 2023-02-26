#ifndef RAPTOR_INPUT_H
#define RAPTOR_INPUT_H
#include <stdint.h>

#define TIME_INFINITY (UINT32_MAX)
#define DATETIME_INFINITY (UINT32_MAX)

#define CALENDAR_EXCEPTION_ADDED (1)
#define CALENDAR_EXCEPTION_REMOVED (2)

typedef uint32_t timeofday_t;
typedef uint32_t datetime_t;

typedef uint16_t stop_id_t;
typedef uint16_t route_id_t;
typedef uint8_t weekdays_t;

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
    uint32_t serving_routes_idx;
    uint32_t transfers_idx;
    uint16_t serving_routes_count;
    uint16_t transfers_count;
} stop_t;

typedef struct
{
    stop_id_t to;
    uint16_t walking_time;
} transfer_t;

typedef struct
{
    datetime_t start;
    datetime_t end;
    uint32_t exceptions_idx;
    uint16_t exceptions_count;
    weekdays_t weekdays;
    uint8_t padding2;
} calendar_t;

typedef struct
{
    datetime_t date;
    uint8_t exception_type;
    uint8_t padding;
    uint16_t padding2;
} calendar_exception_t;

typedef struct
{
    uint16_t calendar_id;
} trip_calendar_t;

typedef struct
{
    uint32_t realtime_route_identifier;
    uint32_t realtime_routes_index;
    uint16_t realtime_routes_count;
    uint16_t realtime_route_identifier_type;
} realtime_route_index_t;

typedef struct
{
    uint16_t route_class;
    uint16_t headsign_variant;
    route_id_t route_id;
    uint16_t stop_offset;
} realtime_route_t;

typedef struct
{
    uint32_t realtime_index;
    int16_t min_delay;
    int16_t max_delay;
} real_time_index_t;

typedef struct
{
    route_stop_t *route_stops;
    stop_time_t *stop_times;
    route_t *routes;
    stop_t *stops;
    uint16_t route_count;
    uint16_t stop_count_total;
    stop_serving_route_t *stop_serving_routes;
    transfer_t *transfers;
    calendar_t *calendars;
    uint16_t calendar_count;
    trip_calendar_t *trip_calendars;
    realtime_route_index_t *realtime_route_index;
    uint16_t realtime_route_identifiers_count;
    realtime_route_t *realtime_routes;
    int16_t *realtime_offsets;
    real_time_index_t *realtime_index;
    calendar_exception_t *calendar_exceptions;
} input_data_t;

#endif