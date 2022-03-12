#include <stdint.h>
#include "input_data.h"
#include "schedule_scanner.h"
#include "bump_allocator.h"
#include "calendar_utils.h"

static int32_t get_next_route_to_step(schedule_scan_state_t *state)
{
    int32_t current = -1;
    for (uint16_t i = 0; i < state->num_routes; i++)
    {
        if (state->route_scan_states[i].current_trip != -1)
        {
            if (state->direction_backwards)
            {
                if (current == -1 || (state->route_scan_states[i].current_trip_time > state->route_scan_states[current].current_trip_time))
                {
                    current = i;
                }
            }
            else
            {
                if (current == -1 || (state->route_scan_states[i].current_trip_time < state->route_scan_states[current].current_trip_time))
                {
                    current = i;
                }
            }
        }
    }
    return current;
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

typedef struct
{
    int32_t trip;
    route_id_t route_id;
    timeofday_t stop_time;
    int32_t trip_next;
    timeofday_t stoptime_next;
} step_route_result_t;

static step_route_result_t step_route(input_data_t *input_data, schedule_scan_state_t *state)
{
    step_route_result_t result;
    int32_t second_route_to_step = -1;
    for (uint16_t i = 0; i < state->num_routes; i++)
    {
        if (state->current_route_scan_state_idx != i && state->route_scan_states[i].current_trip != -1)
        {
            if (second_route_to_step == -1 || ((state->direction_backwards == TRUE && (state->route_scan_states[i].current_trip_time > state->route_scan_states[second_route_to_step].current_trip_time)) ||
                                               (state->direction_backwards == FALSE && (state->route_scan_states[i].current_trip_time < state->route_scan_states[second_route_to_step].current_trip_time))))
            {
                {
                    second_route_to_step = i;
                }
            }
        }
    }
    route_scan_state_t *route_scan_state = &state->route_scan_states[state->current_route_scan_state_idx];
    route_t *route = route_scan_state->route;
    uint16_t trip = route_scan_state->current_trip;
    if (state->direction_backwards)
    {
        result.trip_next = trip > 0 ? get_last_trip_in_service(input_data, route, trip - 1, state->date, state->weekday) : -1;
    }
    else
    {
        result.trip_next = trip < route->trip_count ? get_next_trip_in_service(input_data, route, trip + 1, state->date, state->weekday) : -1;
    }
    result.stoptime_next = result.trip_next >= 0 ? input_data->stop_times[route->stop_time_idx + (result.trip_next * route->stop_count) + route_scan_state->stop_offset].departure_time : 0;
    if (result.trip_next == -1 && second_route_to_step == -1)
    {
        result.trip = -1;
    }
    else if (result.trip_next == -1 || (second_route_to_step != -1 && state->direction_backwards && result.stoptime_next < state->route_scan_states[second_route_to_step].current_trip_time) ||
             (second_route_to_step != -1 && state->direction_backwards == FALSE && result.stoptime_next > state->route_scan_states[second_route_to_step].current_trip_time))
    {
        result.trip = state->route_scan_states[second_route_to_step].current_trip;
        result.route_id = state->route_scan_states[second_route_to_step].route_id;
        result.stop_time = state->route_scan_states[second_route_to_step].current_trip_time;
    }
    else
    {
        result.trip = result.trip_next;
        result.route_id = route_scan_state->route_id;
        result.stop_time = result.stoptime_next;
    }
    return result;
}

schedule_scan_state_t *schedule_scan_initialize(uint16_t max_routes, boolean_t direction_backwards, datetime_t date, uint8_t weekday)
{
    schedule_scan_state_t *state = (schedule_scan_state_t *)malloc(sizeof(schedule_scan_state_t));
    state->num_routes = 0;
    state->direction_backwards = direction_backwards;
    state->date = date;
    state->weekday = weekday;
    state->route_scan_states = (route_scan_state_t *)malloc(sizeof(route_scan_state_t) * max_routes);
    return state;
}

void schedule_scan_add_route(input_data_t *input_data, schedule_scan_state_t *state, route_id_t route_id, uint16_t stop_offset)
{
    route_scan_state_t *route_scan_state = &state->route_scan_states[state->num_routes];
    route_t *route = &input_data->routes[route_id];
    route_scan_state->route = route;
    route_scan_state->route_id = route_id;
    route_scan_state->stop_offset = stop_offset;
    if (state->direction_backwards)
    {
        route_scan_state->current_trip = get_last_trip_in_service(input_data, route, route->trip_count - 1, state->date, state->weekday);
        route_scan_state->current_trip_time = route_scan_state->current_trip > -1 ? input_data->stop_times[route->stop_time_idx + (route_scan_state->current_trip * route->stop_count) + stop_offset].departure_time : 0;
    }
    state->num_routes++;
}

schedule_scan_result_t schedule_scan_advance(input_data_t *input_data, schedule_scan_state_t *state)
{
    int32_t next_route_to_step = get_next_route_to_step(state);
    if (next_route_to_step == -1)
    {
        return (schedule_scan_result_t){.end = TRUE};
    }
    state->current_route_scan_state_idx = next_route_to_step;
    route_scan_state_t *next_route_scan_state = &state->route_scan_states[next_route_to_step];
    step_route_result_t step_route_result = step_route(input_data, state);
    schedule_scan_result_t result = {
        .end = FALSE,
        .current = {
            .route_id = next_route_scan_state->route_id,
            .stop_time = next_route_scan_state->current_trip_time,
            .trip = next_route_scan_state->current_trip},
        .next = {.route_id = step_route_result.route_id, .stop_time = step_route_result.stop_time, .trip = step_route_result.trip}};
    next_route_scan_state->current_trip = step_route_result.trip_next;
    next_route_scan_state->current_trip_time = step_route_result.stoptime_next;
    return result;
}