export interface MonitorResponse {
    data: {
        monitors: {
            locationStop: {
                properties: {
                    name: string;
                }
            };
            lines: {
                richtungsId: string,
                lineId: number,
                departures: {
                    departure: {
                        departureTime: {
                            timeReal?: string,
                            timePlanned?: string
                        }
                    }[];
                }
            }[];
        }[];
    }
}