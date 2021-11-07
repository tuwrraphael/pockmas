#ifndef CALENDAR_UTILS_H
#define CALENDAR_UTILS_H
#include <stdint.h>
#include "input_data.h"
#include "boolean.h"

#ifdef __cplusplus
extern "C"
{
#endif

    boolean_t trip_serviced_at_date(input_data_t *input_data, route_t *route, uint16_t trip, uint32_t date, uint8_t weekday);

    void initialize_calendar_cache(uint16_t num_calendars);

#ifdef __cplusplus
}
#endif

#endif