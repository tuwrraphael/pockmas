#include <iostream>
#include "raptor.h"
#include <vector>
#include <fstream>
#include <iterator>
#include <chrono>
#include "realtime.h"

template <typename T, typename T2>
T *readfile(std::string filename, T *(*alloc)(T2))
{
	std::ifstream file(filename, std::ios::binary);
	file.seekg(0, std::ios_base::end);
	std::size_t size = file.tellg();
	file.seekg(0, std::ios_base::beg);
	T2 num = (T2)(size / sizeof(T));
	T *dest = alloc(num);
	file.read((char *)dest, size);
	file.close();
	return dest;
}

int main()
{
	route_t *routes = readfile("C:\\git\\pockmas\\preprocessing-dist\\routes.bin.bmp", get_routes_memory);
	stop_time_t *stoptimes = readfile("C:\\git\\pockmas\\preprocessing-dist\\stoptimes.bin.bmp", get_stoptimes_memory);
	route_stop_t *routestops = readfile("C:\\git\\pockmas\\preprocessing-dist\\route_stops.bin.bmp", get_route_stops_memory);
	stop_serving_route_t *stop_serving_route = readfile("C:\\git\\pockmas\\preprocessing-dist\\stop_serving_routes.bin.bmp", get_serving_routes_memory);
	stop_t *stops = readfile("C:\\git\\pockmas\\preprocessing-dist\\stops.bin.bmp", get_stops_memory);
	transfer_t *transfers = readfile("C:\\git\\pockmas\\preprocessing-dist\\transfers.bin.bmp", get_transfers_memory);
	calendar_t *calendars = readfile("C:\\git\\pockmas\\preprocessing-dist\\calendar.bin.bmp", get_calendars_memory);
	calendar_exception_t *calendar_exceptions = readfile("../preprocessing-dist/calendar_exceptions.bin.bmp", get_calendar_exceptions_memory);
	trip_calendar_t *trip_calendars = readfile("C:\\git\\pockmas\\preprocessing-dist\\trip_calendars.bin.bmp", get_trip_calendars_memory);
	diva_index_t *diva_index = readfile("../preprocessing-dist/diva_index.bin.bmp", get_diva_index_memory);
	diva_route_t *diva_routes = readfile("../preprocessing-dist/diva_routes.bin.bmp", get_diva_routes_memory);

	//std::ifstream file("../preprocessing-dist/raptor_data.bin.bmp", std::ios::binary);
	//uint32_t sizes[10];
	//file.read((char*)&sizes, sizeof(uint32_t) * 10);
	//void* mem = raptor_allocate(sizes[0], sizes[1], sizes[2], sizes[3], sizes[4], sizes[5], sizes[6], sizes[7], sizes[8], sizes[9]);
	//file.seekg(0, std::ios_base::end);
	//std::size_t size = file.tellg();
	//file.seekg(8 * sizeof(uint32_t), std::ios_base::beg);
	//file.read((char*)mem, size - 10 * sizeof(uint32_t));
	//file.close();

	initialize();

	stoptime_update_t *stoptime_update = get_stoptime_update_memory();
	stoptime_update->diva = 60200299;
	stoptime_update->direction = 0;
	stoptime_update->linie = 426;
	stoptime_update->apply = false;
	stoptime_update->date = 1635458400;
	stoptime_update->weekday = 16;
	stoptime_update->num_updates = 2;
	stoptime_update->time_real[0] = 66633;
	stoptime_update->time_real[1] = 67049;

	process_realtime();

	request_t *request = get_request_memory();
	request->arrival_stations[0] = 13;
	request->departure_stations[0] = 3692;
	request->departure_stations[1] = 119;
	request->num_departure_stations = 1;
	request->num_arrival_stations = 1;
	request->type = TIME_TYPE_DEPARTURE;
	request->date = 1634853600;
	request->weekday = 16;
	request->times[0] = 86160;
	request->times[1] = 84000;

	results_t *results = raptor();
}