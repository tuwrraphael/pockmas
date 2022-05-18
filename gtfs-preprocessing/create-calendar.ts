import fs from "fs";
import path from "path";
import { CalendarExceptionBytes, CalendarBytes } from "./structures";
import { readCalendar } from "./read-calendar";

export async function createCalendar(gtfsPath:string, outputPath:string) {
    let calendar = await readCalendar(gtfsPath, true);
    let calendarArray = new Uint8Array(calendar.length * CalendarBytes);
    let calendarExceptionArray = new Uint8Array(calendar.reduce((acc, cur) => acc + cur.exceptions.length, 0) * CalendarExceptionBytes);
    let calendarExceptionArrayView = new DataView(calendarExceptionArray.buffer);
    let calendarView = new DataView(calendarArray.buffer);
    let exceptionIndex = 0;
    for (let i = 0; i < calendar.length; i++) {
        calendarView.setUint32(i * CalendarBytes, calendar[i].startDate, true);
        calendarView.setUint32(i * CalendarBytes + 4, calendar[i].endDate, true);
        calendarView.setUint32(i * CalendarBytes + 8, exceptionIndex, true);
        calendarView.setUint16(i * CalendarBytes + 12, calendar[i].exceptions.length, true);
        calendarView.setUint8(i * CalendarBytes + 14, calendar[i].weekdays);
        for (let j = 0; j < calendar[i].exceptions.length; j++) {
            calendarExceptionArrayView.setUint32(exceptionIndex * CalendarExceptionBytes, calendar[i].exceptions[j].date, true);
            calendarExceptionArrayView.setUint8(exceptionIndex * CalendarExceptionBytes + 4, calendar[i].exceptions[j].type);
            exceptionIndex++;
        }
    }
    
    let calendarOutput = await fs.promises.open(path.join(outputPath, "calendar.bin.bmp"), "w");
    await calendarOutput.write(new Uint8Array(calendarArray.buffer));
    await calendarOutput.close();
    let calendarExceptionOutput = await fs.promises.open(path.join(outputPath, "calendar_exceptions.bin.bmp"), "w");
    await calendarExceptionOutput.write(new Uint8Array(calendarExceptionArray.buffer));
    await calendarExceptionOutput.close();
    
}