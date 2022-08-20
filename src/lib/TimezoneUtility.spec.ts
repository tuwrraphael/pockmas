import { populateTimeZones } from "timezone-support/dist/lookup-convert";
import * as tzd from "timezone-support/dist/data-2012-2022";
import { TimezoneUtility } from "./TimezoneUtility";

describe("getStartOfDayVienna", () => {
    beforeAll(() => {
        populateTimeZones(tzd);
    })

    it("get start of day correctly", () => {

        let u = new TimezoneUtility("Europe/Vienna");

        let date = new Date("2022-10-29T00:59:00.000+0200");
        let startOfDayVienna = u.getStartOfDay(date);
        expect(startOfDayVienna.unixTime).toBe(1666994400000);
        expect(startOfDayVienna.dayOfWeek).toBe(1 << 5);
    });

});
