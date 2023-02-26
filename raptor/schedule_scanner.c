#include <stdint.h>
#include "input_data.h"
#include "schedule_scanner.h"
#include "bump_allocator.h"
#include "calendar_utils.h"
#include "realtime.h"

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

static schedule_scanner_departure_t get_departure_at_stop(input_data_t *input_data, route_id_t route_id, datetime_t trips_date, route_t *route, uint16_t trip, uint32_t stop_index, boolean_t use_realtime)
{
    stop_time_t *current_stoptime = &input_data->stop_times[route->stop_time_idx + stop_index + trip * route->stop_count];
    if (!use_realtime)
    {
        return (schedule_scanner_departure_t){
            .planned_departure = current_stoptime->departure_time + trips_date,
            .delay = 0};
    }
    int16_t current_trip_delay = get_trip_delay(input_data, route_id, trip);
    return (schedule_scanner_departure_t){
        .planned_departure = current_stoptime->departure_time + trips_date,
        .delay = current_trip_delay};
}

static void route_scan_state_set_trip(input_data_t *input_data, schedule_scan_state_t *state, route_scan_state_t *route_scan_state, uint16_t starting_trip)
{
    route_t *route = route_scan_state->route;
    if (state->direction_backwards)
    {
        starting_trip = starting_trip > route->trip_count - 1 ? route->trip_count - 1 : starting_trip;
        route_scan_state->current_trip = get_last_trip_in_service(input_data, route, starting_trip, route_scan_state->current_date.datetime, route_scan_state->current_date.weekday);
    }
    else
    {
        route_scan_state->current_trip = get_next_trip_in_service(input_data, route, starting_trip, route_scan_state->current_date.datetime, route_scan_state->current_date.weekday);
    }
    if (route_scan_state->current_trip > -1)
    {
        schedule_scanner_departure_t departure = get_departure_at_stop(input_data, route_scan_state->route_id, route_scan_state->current_date.datetime, route, route_scan_state->current_trip, route_scan_state->stop_offset, state->use_realtime);
        route_scan_state->current_departure = departure;
    }
}

static boolean_t is_later(schedule_scanner_departure_t *a, schedule_scanner_departure_t *b, boolean_t use_real_time)
{
    if (use_real_time)
    {
        return (a->planned_departure + a->delay) > (b->planned_departure + b->delay);
    }
    return a->planned_departure > b->planned_departure;
}

static boolean_t is_earlier(schedule_scanner_departure_t *a, schedule_scanner_departure_t *b, boolean_t use_real_time)
{
    if (use_real_time)
    {
        return (a->planned_departure + a->delay) < (b->planned_departure + b->delay);
    }
    return a->planned_departure < b->planned_departure;
}

static int32_t get_next_route_to_step(input_data_t *input_data, schedule_scan_state_t *state)
{
    int32_t current = -1;
    for (uint16_t i = 0; i < state->num_routes; i++)
    {
        route_scan_state_t *route_scan_state = &state->route_scan_states[i];
        // this can be moved to route_scan_state_set_trip and only be done on initialization, as the step_route calculates the date_next
        // and therefore handles the route rewind
        if (route_scan_state->current_trip == -1)
        {
            if (state->direction_backwards && route_scan_state->current_date.datetime > state->end_date)
            {
                route_scan_state->current_date.datetime -= ONE_DAY;
                route_scan_state->current_date.weekday = weekday_before(route_scan_state->current_date.weekday);
                route_scan_state_set_trip(input_data, state, route_scan_state, ADD_ROUTE_AT_LAST_TRIP);
            }
            else if (!state->direction_backwards && route_scan_state->current_date.datetime < state->end_date)
            {
                route_scan_state->current_date.datetime += ONE_DAY;
                route_scan_state->current_date.weekday = weekday_after(route_scan_state->current_date.weekday);
                route_scan_state_set_trip(input_data, state, route_scan_state, 0);
            }
        }
        if (route_scan_state->current_trip != -1)
        {
            if (state->direction_backwards)
            {
                if (current == -1 || is_later(&route_scan_state->current_departure, &state->route_scan_states[current].current_departure, state->use_realtime))
                {
                    current = i;
                }
            }
            else
            {
                if (current == -1 || is_earlier(&route_scan_state->current_departure, &state->route_scan_states[current].current_departure, state->use_realtime))
                {
                    current = i;
                }
            }
        }
    }
    return current;
}

typedef struct
{
    int32_t trip;
    route_id_t route_id;
    schedule_scanner_departure_t departure;
    uint16_t stop_offset;
    int32_t trip_next;
    schedule_scanner_departure_t departure_next;
    date_t date_next;
} step_route_result_t;

static step_route_result_t step_route(input_data_t *input_data, schedule_scan_state_t *state)
{
    step_route_result_t result;
    int32_t second_route_to_step = -1;
    for (uint16_t i = 0; i < state->num_routes; i++)
    {
        if (state->current_route_scan_state_idx != i && state->route_scan_states[i].current_trip != -1)
        {
            if (second_route_to_step == -1 || ((state->direction_backwards == TRUE && is_later(&state->route_scan_states[i].current_departure, &state->route_scan_states[second_route_to_step].current_departure, state->use_realtime)) ||
                                               (state->direction_backwards == FALSE && is_earlier(&state->route_scan_states[i].current_departure, &state->route_scan_states[second_route_to_step].current_departure, state->use_realtime))))
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
        result.trip_next = trip > 0 ? get_last_trip_in_service(input_data, route, trip - 1, route_scan_state->current_date.datetime, route_scan_state->current_date.weekday) : -1;
    }
    else
    {
        result.trip_next = trip < route->trip_count ? get_next_trip_in_service(input_data, route, trip + 1, route_scan_state->current_date.datetime, route_scan_state->current_date.weekday) : -1;
    }

    if (result.trip_next == -1)
    {
        if (state->direction_backwards)
        {
            if (route_scan_state->current_date.datetime > state->end_date)
            {
                result.date_next = (date_t){
                    .datetime = route_scan_state->current_date.datetime - ONE_DAY,
                    .weekday = weekday_before(route_scan_state->current_date.weekday)};
                result.trip_next = get_last_trip_in_service(input_data, route, route->trip_count-1, result.date_next.datetime, result.date_next.weekday);
            }
        }
        else
        {
            if (route_scan_state->current_date.datetime < state->end_date)
            {
                result.date_next = (date_t){
                    .datetime = route_scan_state->current_date.datetime + ONE_DAY,
                    .weekday = weekday_after(route_scan_state->current_date.weekday)};
                result.trip_next = get_next_trip_in_service(input_data, route, 0, result.date_next.datetime, result.date_next.weekday);
            }
        }
    }
    else
    {
        result.date_next = route_scan_state->current_date;
    }

    if (result.trip_next >= 0)
    {
        result.departure_next = get_departure_at_stop(input_data, route_scan_state->route_id, result.date_next.datetime, route, result.trip_next, route_scan_state->stop_offset, state->use_realtime);
    }
    if (result.trip_next == -1 && second_route_to_step == -1)
    {
        result.trip = -1;
    }
    else if (result.trip_next == -1 || (second_route_to_step != -1 && state->direction_backwards && is_earlier(&result.departure_next, &state->route_scan_states[second_route_to_step].current_departure, state->use_realtime)) ||
             (second_route_to_step != -1 && state->direction_backwards == FALSE && is_later(&result.departure_next, &state->route_scan_states[second_route_to_step].current_departure, state->use_realtime)))
    {
        result.trip = state->route_scan_states[second_route_to_step].current_trip;
        result.route_id = state->route_scan_states[second_route_to_step].route_id;
        result.stop_offset = state->route_scan_states[second_route_to_step].stop_offset;
        result.departure = state->route_scan_states[second_route_to_step].current_departure;
    }
    else
    {
        result.trip = result.trip_next;
        result.route_id = route_scan_state->route_id;
        result.stop_offset = route_scan_state->stop_offset;
        result.departure = result.departure_next;
    }
    return result;
}

schedule_scan_state_t *schedule_scan_initialize(uint16_t max_routes, boolean_t direction_backwards, datetime_t end_date, boolean_t use_realtime)
{
    schedule_scan_state_t *state = (schedule_scan_state_t *)malloc(sizeof(schedule_scan_state_t));
    state->num_routes = 0;
    state->direction_backwards = direction_backwards;
    state->use_realtime = use_realtime;
    state->end_date = end_date;
    state->route_scan_states = (route_scan_state_t *)malloc(sizeof(route_scan_state_t) * max_routes);
    return state;
}

void schedule_scan_add_route(input_data_t *input_data, schedule_scan_state_t *state, route_id_t route_id, uint16_t stop_offset, uint16_t starting_trip, date_t trip_date)
{
    route_scan_state_t *route_scan_state = &state->route_scan_states[state->num_routes];
    route_t *route = &input_data->routes[route_id];
    route_scan_state->route = route;
    route_scan_state->route_id = route_id;
    route_scan_state->stop_offset = stop_offset;
    route_scan_state->current_date = trip_date;
    route_scan_state_set_trip(input_data, state, route_scan_state, starting_trip);
    state->num_routes++;
}

schedule_scan_result_t schedule_scan_advance(input_data_t *input_data, schedule_scan_state_t *state)
{
    int32_t next_route_to_step = get_next_route_to_step(input_data, state);
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
            .departure = next_route_scan_state->current_departure,
            .trip = next_route_scan_state->current_trip,
            .stop_offset = next_route_scan_state->stop_offset},
        .next = {.route_id = step_route_result.route_id, .departure = step_route_result.departure, .trip = step_route_result.trip, .stop_offset = step_route_result.stop_offset}};
    next_route_scan_state->current_trip = step_route_result.trip_next;
    next_route_scan_state->current_departure = step_route_result.departure_next;
    next_route_scan_state->current_date = step_route_result.date_next;
    return result;
}