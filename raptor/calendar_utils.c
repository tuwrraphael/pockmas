#include "calendar_utils.h"
#include "bump_allocator.h"

#define NUM_CACHES (3)

typedef struct
{
    boolean_t set;
    boolean_t value;
} calendar_cache_entry_t;

typedef struct
{
    calendar_cache_entry_t *cache;
    datetime_t date;
} calendar_cache_t;

static calendar_cache_t calendar_caches[NUM_CACHES];
static uint8_t last_accessed_cache = 0;
static uint16_t number_of_calendars;

void initialize_calendar_cache(uint16_t num_calendars)
{
    for (uint8_t i = 0; i < NUM_CACHES; i++)
    {
        calendar_caches[i].cache = malloc(sizeof(calendar_cache_entry_t) * num_calendars);
        calendar_caches[i].date = 0;
    }
    number_of_calendars = num_calendars;
}

static void clear_calendar_cache(calendar_cache_entry_t *cache)
{
    for (uint16_t i = 0; i < number_of_calendars; i++)
    {
        cache[i].set = FALSE;
    }
}

static calendar_cache_entry_t *get_calendar_cache(datetime_t date)
{
    uint8_t index;
    for (uint8_t i = 0; i < NUM_CACHES; i++)
    {
        index = (last_accessed_cache + i) % NUM_CACHES;
        if (calendar_caches[index].date == date)
        {
            last_accessed_cache = index;
            return calendar_caches[index].cache;
        }
    }
    clear_calendar_cache(calendar_caches[index].cache);
    calendar_caches[index].date = date;
    return calendar_caches[index].cache;
}

static uint8_t adjust_weekday(uint8_t weekday, int8_t offset)
{
    if (offset == 0)
    {
        return weekday;
    }
    while (offset > 0)
    {
        offset--;
        if (weekday == SUNDAY)
        {
            weekday = MONDAY;
        }
        else
        {
            weekday = weekday << 1;
        }
    }
    while (offset < 0)
    {
        offset++;
        if (weekday == MONDAY)
        {
            weekday = SUNDAY;
        }
        else
        {
            weekday = weekday >> 1;
        }
    }
    return weekday;
}

uint8_t weekday_before(uint8_t weekday)
{
    return adjust_weekday(weekday, -1);
}

uint8_t weekday_after(uint8_t weekday)
{
    return adjust_weekday(weekday, 1);
}

date_t find_date(datetime_t datetime, datetime_t date_with_known_weekday, uint8_t known_weekday)
{
    int8_t offset = 0;
    date_t res;

    if (datetime > date_with_known_weekday)
    {
        uint32_t diff = (datetime - date_with_known_weekday) / ONE_DAY;
        offset = diff;
    }
    else if (datetime < date_with_known_weekday)
    {
        uint32_t diff = (date_with_known_weekday - datetime) / ONE_DAY;
        offset = 0 - diff;
    }
    res.weekday = adjust_weekday(known_weekday, offset);
    res.datetime = date_with_known_weekday + (offset * ONE_DAY);
    return res;
}

boolean_t trip_serviced_at_date(input_data_t *input_data, route_t *route, uint16_t trip, uint32_t date, uint8_t weekday)
{
    uint16_t calendarId = input_data->trip_calendars[route->calendar_idx + trip].calendar_id;
    calendar_cache_entry_t *cache = get_calendar_cache(date);
    if (cache[calendarId].set)
    {
        return cache[calendarId].value;
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
    cache[calendarId].set = TRUE;
    cache[calendarId].value = result;
    return result;
}