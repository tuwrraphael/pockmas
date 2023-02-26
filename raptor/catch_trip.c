#include "catch_trip.h"
#include "calendar_utils.h"
#include "realtime.h"

typedef struct
{
    datetime_t planned_departure;
    int16_t delay;
    datetime_t depature;
} realtime_adjusted_departure_t;

static realtime_adjusted_departure_t get_adjusted_depature_time(input_data_t *input_data, route_t *route, route_id_t route_id, uint16_t trip, uint32_t stop_index, date_t after_date)
{
    realtime_adjusted_departure_t result;
    stop_time_t *stop_time = &input_data->stop_times[route->stop_time_idx + stop_index + route->stop_count * trip];
    result.delay = get_trip_delay(input_data, route_id, trip);
    result.planned_departure = after_date.datetime + stop_time->departure_time;
    result.depature = result.planned_departure + result.delay;
    return result;
}

static uint16_t get_lower_bound(input_data_t *input_data, route_t *route, route_id_t route_id, uint32_t stop_index, date_t after_date, datetime_t after)
{
    uint16_t upper = route->trip_count;
    if (upper == 0)
    {
        return 0;
    }
    // the maximum a trip can be early is stored in the min_delay, it can never be > 0
    datetime_t search_time = after + input_data->realtime_index[route_id].min_delay;
    uint16_t lower = 0;
    while (lower < upper)
    {
        uint16_t trip = (upper + lower) / 2;
        stop_time_t *stop_time = &input_data->stop_times[route->stop_time_idx + stop_index + route->stop_count * trip];
        datetime_t planned_departure = after_date.datetime + stop_time->departure_time;
        if (planned_departure < search_time)
        {
            lower = trip + 1;
        }
        else
        {
            upper = trip;
        }
    }
    return lower;
}

static void check_trips_advancing(input_data_t *input_data, route_id_t route_id, uint32_t stop_index, date_t after_date, datetime_t after, caught_trip_t *output)
{
    route_t *route = &input_data->routes[route_id];
    uint16_t first_theoretically_catchable_trip = get_lower_bound(input_data, route, route_id, stop_index, after_date, after);
    if (first_theoretically_catchable_trip >= route->trip_count)
    {
        return;
    }
    for (uint16_t trip = first_theoretically_catchable_trip; trip < route->trip_count; trip++)
    {
        if (trip_serviced_at_date(input_data, route, trip, after_date.datetime, after_date.weekday))
        {
            // it can happen that the first_theoretically_catchable_trip is not serviced at
            // the date, but if it the next trip has a negative delay, it can't be catched.
            // therefore we need to check again
            realtime_adjusted_departure_t adjusted_time = get_adjusted_depature_time(input_data, route, route_id, trip, stop_index, after_date);
            if (adjusted_time.depature < after)
            {
                continue;
            }
            if (output->trip != -1 && output->departure < adjusted_time.depature)
            {
                if (output->departure < adjusted_time.planned_departure + input_data->realtime_index[route_id].min_delay)
                {
                    return;
                }
                continue;
            }
            output->trip = trip;
            output->boarded_date = after_date.datetime;
            output->departure = adjusted_time.depature;
            output->planned_departure = adjusted_time.planned_departure;
            output->delay = adjusted_time.delay;
            break;
        }
    }
}

caught_trip_t catch_trip(input_data_t *input_data, route_id_t route_id, uint32_t stop_index, datetime_t after, datetime_t request_day, uint8_t request_weekday)
{
    caught_trip_t earliest_trip;
    earliest_trip.trip = -1;
    date_t date_today = find_date(after, request_day, request_weekday);
    date_t date_yesterday = {
        .datetime = date_today.datetime - ONE_DAY,
        .weekday = weekday_before(date_today.weekday)};
    check_trips_advancing(input_data, route_id, stop_index, date_yesterday, after, &earliest_trip);
    check_trips_advancing(input_data, route_id, stop_index, date_today, after, &earliest_trip);
    date_t date_tomorrow = {
        .datetime = date_today.datetime + ONE_DAY,
        .weekday = weekday_after(date_today.weekday)};
    check_trips_advancing(input_data, route_id, stop_index, date_tomorrow, after, &earliest_trip);
    return earliest_trip;
}