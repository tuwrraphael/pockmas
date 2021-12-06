import { populateTimeZones } from "timezone-support/dist/lookup-convert";
import * as tzd from "timezone-support/dist/data-2012-2022";
import { getStartOfDayVienna } from "./getStartOfDayVienna";

describe("getStartOfDayVienna", () => {
    beforeAll(() => {
        populateTimeZones(tzd);
    })


    it("get start of day correctly", () => {
        let date = new Date("2021-12-06T00:59:00.000+0100");
        let startOfDayVienna = getStartOfDayVienna(date);
        expect(startOfDayVienna.unixTime).toBe(new Date("2021-12-06T00:00:00.000+0100").getTime());
        expect(startOfDayVienna.dayOfWeek).toBe(1);
    });

});
