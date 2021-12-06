import { findTimeZone, getUnixTime, getZonedTime } from "timezone-support/dist/lookup-convert";

function dayOfWeekToMask(dayOfWeek: number): number {
    let mask = 0;
    if (dayOfWeek == 0) {
        mask = 64;
    } else {
        mask = 1 << (dayOfWeek - 1);
    }
    return mask;
}

export function getStartOfDayVienna(date: Date) {
    const vienna = findTimeZone("Europe/Vienna");
    const viennaTime = getZonedTime(date, vienna);
    const startOfDayVienna = getUnixTime({
        year: viennaTime.year,
        month: viennaTime.month,
        day: viennaTime.day,
        hours: 0,
        minutes: 0,
        seconds: 0,
    }, vienna);
    return { unixTime: startOfDayVienna, dayOfWeek: dayOfWeekToMask(viennaTime.dayOfWeek) };
}
