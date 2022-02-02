#ifndef CATCH_TRIP_H
#define CATCH_TRIP_H

#include "input_data.h"
#include <stdint.h>

typedef struct
{
    int32_t trip;
    datetime_t boarded_date;
    datetime_t departure;
    datetime_t planned_departure;
    int16_t delay;
} caught_trip_t;

caught_trip_t catch_trip(input_data_t *input_data, route_id_t route_id, uint32_t stop_index, datetime_t after, datetime_t request_day, uint8_t request_weekday);

#endif