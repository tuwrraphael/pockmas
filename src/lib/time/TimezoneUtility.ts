import { findTimeZone, getUnixTime, getZonedTime } from "timezone-support/lookup-convert";

export class TimezoneUtility {

    private timezone: any;

    constructor(private tz: string) {
    }

    private getTimezone() {
        if (!this.timezone) {
            this.timezone = findTimeZone(this.tz);
        }
        return this.timezone;
    }

    private dayOfWeekToMask(dayOfWeek: number): number {
        let mask = 0;
        if (dayOfWeek == 0) {
            mask = 64;
        } else {
            mask = 1 << (dayOfWeek - 1);
        }
        return mask;
    }

    getStartOfDay(date: Date) {
        const viennaTime = getZonedTime(date, this.getTimezone());
        const startOfDayVienna = getUnixTime({
            year: viennaTime.year,
            month: viennaTime.month,
            day: viennaTime.day,
            hours: 0,
            minutes: 0,
            seconds: 0,
        }, this.getTimezone());
        return { unixTime: startOfDayVienna, dayOfWeek: this.dayOfWeekToMask(viennaTime.dayOfWeek) };
    }

    getDateInTimezone(year: number, month: number, day: number, hours: number, minutes: number, seconds: number) {
        return new Date(getUnixTime({
            year: year,
            month: month,
            day: day,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
        }, this.getTimezone()));
    }

}
