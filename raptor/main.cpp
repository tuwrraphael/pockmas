#include <iostream>
#include "raptor.h"
#include <vector>
#include <fstream>
#include <iterator>
#include <chrono>

template <typename T, typename T2>
T* readfile(std::string filename, T* (*alloc)(T2)) {
	std::ifstream file(filename, std::ios::binary);
	file.seekg(0, std::ios_base::end);
	std::size_t size = file.tellg();
	file.seekg(0, std::ios_base::beg);
	T2 num = (T2)(size / sizeof(T));
	T* dest = alloc(num);
	file.read((char*)dest, size);
	file.close();
	return dest;
}

int main()
{
	route_t* routes = readfile("C:\\git\\pockmas\\preprocessing-dist\\routes.bin", get_routes_memory);
	stop_time_t* stoptimes = readfile("C:\\git\\pockmas\\preprocessing-dist\\stoptimes.bin", get_stoptimes_memory);
	route_stop_t* routestops = readfile("C:\\git\\pockmas\\preprocessing-dist\\route_stops.bin", get_route_stops_memory);
	stop_serving_route_t* stop_serving_route = readfile("C:\\git\\pockmas\\preprocessing-dist\\stop_serving_routes.bin", get_serving_routes_memory);
	stop_t* stops = readfile("C:\\git\\pockmas\\preprocessing-dist\\stops.bin", get_stops_memory);
	transfer_t* transfers = readfile("C:\\git\\pockmas\\preprocessing-dist\\transfers.bin", get_transfers_memory);
	calendar_t* calendars = readfile("C:\\git\\pockmas\\preprocessing-dist\\calendar.bin", get_calendars_memory);
	trip_calendar_t* trip_calendars = readfile("C:\\git\\pockmas\\preprocessing-dist\\trip_calendars.bin", get_trip_calendars_memory);

	request_t *request = get_request_memory();
	request->arrival_stations[0] = 3731;
	request->departure_stations[0] = 20;
	request->departure_stations[1] = 3581;
	request->num_departure_stations = 2;
	request->num_arrival_stations = 1;
	request->type = TIME_TYPE_DEPARTURE;
	request->date = 1633544418;
	request->weekday = (1 << 3);
	request->times[0] = 73800;
	request->times[1] = 73840;

	results_t* results = raptor();
}