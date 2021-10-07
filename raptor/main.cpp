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
	route_t* routes = readfile("C:\\git\\pockmas\\routes.bin", get_routes_memory);
	stop_time_t* stoptimes = readfile("C:\\git\\pockmas\\stoptimes.bin", get_stoptimes_memory);
	route_stop_t* routestops = readfile("C:\\git\\pockmas\\route_stops.bin", get_route_stops_memory);
	stop_serving_route_t* stop_serving_route = readfile("C:\\git\\pockmas\\stop_serving_routes.bin", get_serving_routes_memory);
	stop_t* stops = readfile("C:\\git\\pockmas\\stops.bin", get_stops_memory);
	transfer_t* transfers = readfile("C:\\git\\pockmas\\transfers.bin", get_transfers_memory);
	calendar_t* calendars = readfile("C:\\git\\pockmas\\calendar.bin", get_calendars_memory);
	trip_calendar_t* trip_calendars = readfile("C:\\git\\pockmas\\trip_calendars.bin", get_trip_calendars_memory);


	results_t* results = raptor(1633544418, (1 << 3), 73800, 3581, 3731);

	/*for (uint8_t i = 0; i < 10; i++) {
		auto start_time = std::chrono::high_resolution_clock::now();
		raptor(1633544418, (1 << 3), 73800, 3731, 3582);
		auto end_time = std::chrono::high_resolution_clock::now();
		auto time = end_time - start_time;
		std::cout << time / std::chrono::milliseconds(1) << "ms to run.\n";
	}
	*/
}