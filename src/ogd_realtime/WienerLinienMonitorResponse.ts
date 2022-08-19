export interface WienerLinienMonitorResponse {
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
                name: string,
                towards: string,
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