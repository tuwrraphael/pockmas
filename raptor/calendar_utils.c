#include "calendar_utils.h"
#include "bump_allocator.h"

typedef struct
{
    boolean_t set;
    boolean_t value;
} calendar_cache_entry_t;

typedef struct
{
    datetime_t date;
    calendar_cache_entry_t *cache;
} calendar_cache_t;

static calendar_cache_t calendar_cache;

void initialize_calendar_cache(uint16_t num_calendars)
{
    calendar_cache.date = 0;
    calendar_cache.cache = malloc(sizeof(calendar_cache_t) * num_calendars);
}

static void clear_calendar_cache(input_data_t *input_data)
{
    for (uint16_t i = 0; i < input_data->calendar_count; i++)
    {
        calendar_cache.cache[i].set = FALSE;
    }
}

boolean_t trip_serviced_at_date(input_data_t *input_data, route_t *route, uint16_t trip, uint32_t date, uint8_t weekday)
{
    uint16_t calendarId = input_data->trip_calendars[route->calendar_idx + trip].calendar_id;
    if (calendar_cache.date != date)
    {
        clear_calendar_cache(input_data);
        calendar_cache.date = date;
    }
    if (calendar_cache.cache[calendarId].set)
    {
        return calendar_cache.cache[calendarId].value;
    }
    calendar_t *trip_calendar = &input_data->calendars[input_data->trip_calendars[route->calendar_idx + trip].calendar_id];
    boolean_t result;
    if (date >= trip_calendar->start && date < trip_calendar->end && (weekday & trip_calendar->weekdays) > 0)
    {
        result = TRUE;
        for (uint16_t i = 0; i < trip_calendar->exceptions_count; i++)
        {
            calendar_exception_t *exception = &input_data->calendar_exceptions[trip_calendar->exceptions_idx + i];
            if (exception->exception_type == CALENDAR_EXCEPTION_REMOVED)
            {
                if (date == exception->date)
                {
                    result = FALSE;
                    break;
                }
            }
        }
    }
    else
    {
        result = FALSE;
        for (uint16_t i = 0; i < trip_calendar->exceptions_count; i++)
        {
            calendar_exception_t *exception = &input_data->calendar_exceptions[trip_calendar->exceptions_idx + i];
            if (exception->exception_type == CALENDAR_EXCEPTION_ADDED)
            {
                if (date == exception->date)
                {
                    result = TRUE;
                    break;
                }
            }
        }
    }
    calendar_cache.cache[calendarId].set = TRUE;
    calendar_cache.cache[calendarId].value = result;
    return result;
}

uint8_t weekday_before(uint8_t weekday) {
	if (weekday == MONDAY) {
		return SUNDAY;
	}
	return weekday >> 1;
}