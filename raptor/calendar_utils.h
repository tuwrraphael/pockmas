#ifndef CALENDAR_UTILS_H
#define CALENDAR_UTILS_H
#include <stdint.h>
#include "input_data.h"
#include "boolean.h"

#define ONE_DAY (86400)

#define MONDAY (1 << 0)
#define TUESDAY (1 << 1)
#define WEDNESDAY (1 << 2)
#define THURSDAY (1 << 3)
#define FRIDAY (1 << 4)
#define SATURDAY (1 << 5)
#define SUNDAY (1 << 6)

typedef struct {
    datetime_t datetime;
    uint8_t weekday;
} date_t;

#ifdef __cplusplus
extern "C"
{
#endif

    boolean_t trip_serviced_at_date(input_data_t *input_data, route_t *route, uint16_t trip, uint32_t date, uint8_t weekday);

    void initialize_calendar_cache(uint16_t num_calendars);
    
    uint8_t weekday_before(uint8_t weekday);

    date_t find_date(datetime_t datetime, datetime_t date_with_known_weekday, uint8_t known_weekday);

#ifdef __cplusplus
}
#endif

#endif