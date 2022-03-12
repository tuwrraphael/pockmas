#ifndef APP_SCHEDULE_SCANNER_H
#define APP_SCHEDULE_SCANNER_H

#include <stdint.h>
#include "input_data.h"
#include "boolean.h"

typedef struct
{
    boolean_t active;
    route_t *route;
    uint16_t stop_offset;
    route_id_t route_id;
    int32_t current_trip;
    timeofday_t current_trip_time;
} route_scan_state_t;

typedef struct
{
    uint16_t num_routes;
    uint16_t current_route_scan_state_idx;
    route_scan_state_t *route_scan_states;
    datetime_t date;
    uint8_t weekday;
    boolean_t direction_backwards;
} schedule_scan_state_t;

typedef struct
{
    int32_t trip;
    route_id_t route_id;
    timeofday_t stop_time;
} schedule_entry_t;

typedef struct
{
    boolean_t end;
    schedule_entry_t current;
    schedule_entry_t next;
} schedule_scan_result_t;

schedule_scan_state_t *schedule_scan_initialize(uint16_t max_routes, boolean_t direction_backwards, datetime_t date, uint8_t weekday);

void schedule_scan_add_route(input_data_t *input_data, schedule_scan_state_t *state, route_id_t route_id, uint16_t stop_offset);

schedule_scan_result_t schedule_scan_advance(input_data_t *input_data, schedule_scan_state_t *state);

#endif