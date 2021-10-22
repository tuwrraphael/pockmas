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
	route_t* routes = readfile("C:\\git\\pockmas\\preprocessing-dist\\routes.bin.bmp", get_routes_memory);
	stop_time_t* stoptimes = readfile("C:\\git\\pockmas\\preprocessing-dist\\stoptimes.bin.bmp", get_stoptimes_memory);
	route_stop_t* routestops = readfile("C:\\git\\pockmas\\preprocessing-dist\\route_stops.bin.bmp", get_route_stops_memory);
	stop_serving_route_t* stop_serving_route = readfile("C:\\git\\pockmas\\preprocessing-dist\\stop_serving_routes.bin.bmp", get_serving_routes_memory);
	stop_t* stops = readfile("C:\\git\\pockmas\\preprocessing-dist\\stops.bin.bmp", get_stops_memory);
	transfer_t* transfers = readfile("C:\\git\\pockmas\\preprocessing-dist\\transfers.bin.bmp", get_transfers_memory);
	calendar_t* calendars = readfile("C:\\git\\pockmas\\preprocessing-dist\\calendar.bin.bmp", get_calendars_memory);
	trip_calendar_t* trip_calendars = readfile("C:\\git\\pockmas\\preprocessing-dist\\trip_calendars.bin.bmp", get_trip_calendars_memory);

	//std::ifstream file("../preprocessing-dist/raptor_data.bin.bmp", std::ios::binary);
	//uint32_t sizes[8];
	//file.read((char*)&sizes, sizeof(uint32_t) * 8);
	//void* mem = raptor_allocate(sizes[0], sizes[1], sizes[2], sizes[3], sizes[4], sizes[5], sizes[6], sizes[7]);
	//file.seekg(0, std::ios_base::end);
	//std::size_t size = file.tellg();
	//file.seekg(8 * sizeof(uint32_t), std::ios_base::beg);
	//file.read((char*)mem, size - 8 * sizeof(uint32_t));
	//file.close();

	request_t* request = get_request_memory();
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

	results_t* results = raptor();
}