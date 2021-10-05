#include "./bump_allocator.h"

#define MAX_INTERCHANGES (8)

typedef unsigned short boolean_t;
#define TRUE (1)
#define FALSE (0)

typedef unsigned long int time_t;

typedef unsigned int stop_id_t;
typedef unsigned int route_id_t;

typedef struct
{
    unsigned long int stop_time_idx;
    unsigned long int stop_idx;
    unsigned int stop_count;
    unsigned int trip_count;
} route_t;

typedef struct
{
    time_t departure_time;
    time_t arrival_time;
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
    unsigned long int serving_routes_idx;
    unsigned long int serving_routes_count;
} stop_t;

typedef struct
{
    route_stop_t *route_stops;
    stop_time_t *stop_times;
    route_t *routes;
    stop_t *stops;
    unsigned long int route_count;
    unsigned int stop_count_total;
    stop_serving_route_t *stop_serving_routes;
} input_data_t;

typedef struct
{
    boolean_t set;
    stop_id_t stop_id;
} queue_t;

typedef unsigned short marking_t;

#define MARKED (1)
#define UNMARKED (0)

static input_data_t input_data;

void *get_stoptimes_memory(unsigned int number_of_stoptimes)
{
    input_data.stop_times = allocate(sizeof(stop_time_t *) * number_of_stoptimes);
    return input_data.stop_times;
}

void *get_routes_memory(unsigned int number_of_routes)
{
    input_data.routes = allocate(sizeof(route_t) * number_of_routes);
    input_data.route_count = number_of_routes;
    return input_data.routes;
}

void *get_route_stops_memory(unsigned int number_of_route_stops, unsigned int stop_count_total)
{
    input_data.stop_count_total = stop_count_total;
    input_data.route_stops = allocate(sizeof(route_stop_t) * number_of_route_stops);
    return input_data.route_stops;
}

void *get_serving_routes_memory(unsigned long int number_of_stop_routes)
{
    input_data.stop_serving_routes = allocate(sizeof(stop_serving_route_t) * number_of_stop_routes);
    return input_data.stop_serving_routes;
}

void *get_stops_memory(unsigned int number_of_stops)
{
    input_data.stop_count_total = number_of_stops;
    input_data.stops = allocate(sizeof(stop_t) * number_of_stops);
    return input_data.stops;
}

static boolean_t is_before(stop_id_t stop_a, stop_id_t stop_b, route_id_t route_id)
{
    route_t *route = &input_data.routes[route_id];
    for (unsigned long int i = route->stop_idx; i < route->stop_idx + route->stop_count; i++)
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

static time_t min_time(time_t a, time_t b)
{
    return a < b ? a : b;
}

int earliest_trip(route_id_t route_id, unsigned int stop_index, time_t after)
{
    int earliest_trip = 0;
    route_t *route = &input_data.routes[route_id];
    for (unsigned long int i = route->stop_time_idx + stop_index; i < route->stop_time_idx + stop_index + route->trip_count * route->stop_count; i += route->stop_count)
    {
        stop_time_t *stop_time = &input_data.stop_times[i];
        if (!is_before(stop_time->departure_time, after, route_id))
        {
            return earliest_trip;
        }
        earliest_trip++;
    }
    return -1;
}

unsigned int raptor(time_t departure_time, stop_id_t start, stop_id_t target)
{
    time_t *earliest_known_arrival_times = allocate(sizeof(time_t) * input_data.stop_count_total);
    marking_t *marking = allocate(sizeof(time_t) * input_data.stop_count_total);
    queue_t *queue = allocate(sizeof(queue_t) * input_data.route_count);
    for (unsigned int i = 0; i < input_data.stop_count_total; i++)
    {
        earliest_known_arrival_times[i] = 0;
        marking[i] = MARKED;
    }
    time_t *earliest_known_arrival_times_with_trips[8];

    for (unsigned int round = 0; round < MAX_INTERCHANGES; round++)
    {
        earliest_known_arrival_times_with_trips[round] = allocate(sizeof(time_t) * input_data.stop_count_total);
        for (unsigned int i = 0; i < input_data.stop_count_total; i++)
        {

            earliest_known_arrival_times_with_trips[round] = 0;
        }
        for (unsigned long int i = 0; i < input_data.route_count; i++)
        {
            queue[i].set = FALSE;
        }

        for (unsigned int stop_id = 0; stop_id < input_data.stop_count_total; stop_id++)
        {
            if (marking[stop_id] == UNMARKED)
            {
                continue;
            }
            stop_t *stop = &input_data.stops[stop_id];
            // for each route serving this stop
            for (unsigned long int j = stop->serving_routes_idx; j < stop->serving_routes_count + stop->serving_routes_idx; j++)
            {
                route_id_t route_id = input_data.stop_serving_routes[j].route_id;
                if (route_id != 0) {
                    return stop_id;
                }
                if (queue[route_id].set != FALSE && is_before(stop_id, queue[route_id].stop_id, route_id))
                {
                    queue[route_id].stop_id = stop_id;
                }
                else
                {
                    queue[route_id].set = TRUE;
                    queue[route_id].stop_id = stop_id;
                }
            }
            marking[stop_id] = UNMARKED;
        }

        for (unsigned long int i = 0; i < input_data.route_count; i++)
        {
            if (queue[i].set == FALSE)
            {
                continue;
            }
            route_t *route = &input_data.routes[i];
            stop_id_t stop_id = queue[i].stop_id;
            unsigned long int start_index;
            for (start_index = route->stop_idx; start_index < route->stop_idx + route->stop_count; start_index++)
            {
                if (stop_id == input_data.route_stops[start_index].stop_id)
                {
                    break;
                }
            }
            int current_trip = -1;
            for (unsigned int j = start_index; j < route->stop_idx + route->stop_count; j++)
            {
                stop_id_t current_stop_id = input_data.route_stops[j].stop_id;
                stop_time_t *current_stoptime = &input_data.stop_times[route->stop_time_idx + current_trip * route->stop_count + j];
                if (current_trip > -1)
                {
                    time_t arrival_at_j = current_stoptime->arrival_time;
                    if (arrival_at_j < min_time(earliest_known_arrival_times[current_stop_id], earliest_known_arrival_times[target]))
                    {
                        earliest_known_arrival_times_with_trips[round][current_stop_id] = arrival_at_j;
                        earliest_known_arrival_times[current_stop_id] = arrival_at_j;
                        marking[current_stop_id] = MARKED;
                    }
                }
                if (round > 0 && earliest_known_arrival_times_with_trips[round - 1][current_stop_id] < current_stoptime->departure_time)
                {
                    current_trip = earliest_trip(i, j - route->stop_idx, earliest_known_arrival_times_with_trips[round - 1][current_stop_id]);
                }
            }
        }
        // TODO footpaths
        boolean_t marked = FALSE;
        for (unsigned int i = 0; i < input_data.stop_count_total; i++)
        {
            if (marking[i] == UNMARKED)
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