#ifndef RAPTOR_REALTIME_H
#define RAPTOR_REALTIME_H
#include <stdint.h>
#include "input_data.h"
#include "boolean.h"

#define MAX_STOPTIME_UPDATES (5)

typedef struct
{
    route_id_t route_id;
    uint16_t trip;
    int16_t realtime_offset;
    uint16_t padding;
} stoptime_update_result;

typedef struct
{
    uint32_t diva;
    uint16_t linie;
    uint8_t direction;
    uint8_t weekday;
    datetime_t date;
    boolean_t apply;
    uint8_t num_updates;
    uint16_t padding;
    timeofday_t time_real[MAX_STOPTIME_UPDATES];
    stoptime_update_result results[MAX_STOPTIME_UPDATES];
    uint8_t num_matches[MAX_STOPTIME_UPDATES];
} stoptime_update_t;

#ifdef __cplusplus
extern "C"
{
#endif

#ifndef WASM_BUILD

#define __attribute__(a) 

#endif

    void initialize_realtime_memory(input_data_t *input_data);

    __attribute__((export_name("get_stoptime_update_memory"))) stoptime_update_t *get_stoptime_update_memory();

    void process_stoptime_update(input_data_t *input_data);

#ifdef __cplusplus
}
#endif

#endif