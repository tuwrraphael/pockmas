
export interface OebbMonitorResponse {
    journey: {
        // local planned time of arrival eg 14:19
        ti: string;
        // local date of arrival eg. 20.08.2022
        da: string;
        // linie eg. "REX 3"
        pr: string;
        // direction eg. "Wien Meidling Bahnhof"
        st: string;
        // platform eg "1"
        tr: string;
        // whether the platform changed
        trChg: boolean;
        // realtime info
        rt: {
            // delayed time eg "14:20"
            dlt: string;
            // delayed date eg "14.12.2019"
            dld: string;
            // status eg. "Ausfall"
            status: string;
        } | false;
    }[];
}
