const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const stripBom = require("strip-bom-stream");
const { getUnixTime, findTimeZone } = require("timezone-support");

let timezone = findTimeZone("Europe/Vienna");

function parseDate(date) {
    let year = date.substring(0, 4);
    let month = date.substring(4, 6);
    let day = date.substring(6, 8);
    return getUnixTime({
        year: year,
        month: month,
        day: day,
        hours: 0,
        minutes: 0,
        seconds: 0
    }, timezone) / 1000;
}

async function readExceptions(gtfsPath) {
    const calendarStream = fs.createReadStream(path.join(gtfsPath, "calendar_dates.txt"));
    return new Promise(resolve => {
        let calendarExceptions = {};
        calendarStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => {
                //service_id,date,exception_type
                calendarExceptions[data.service_id] = calendarExceptions[data.service_id] || [];
                calendarExceptions[data.service_id].push({
                    date: parseDate(data.date),
                    type: parseInt(data.exception_type)
                });
            })
            .on('end', () => {
                resolve(calendarExceptions);
            });
    });
}

async function readCalendar(gtfsPath, includeExceptions) {
    const calendarStream = fs.createReadStream(path.join(gtfsPath, "calendar.txt"));
    return new Promise(resolve => {
        let calendar = [];
        calendarStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => {
                let weekdays = 0;
                weekdays += data.monday === '1' ? 1 : 0;
                weekdays += data.tuesday === '1' ? 2 : 0;
                weekdays += data.wednesday === '1' ? 4 : 0;
                weekdays += data.thursday === '1' ? 8 : 0;
                weekdays += data.friday === '1' ? 16 : 0;
                weekdays += data.saturday === '1' ? 32 : 0;
                weekdays += data.sunday === '1' ? 64 : 0;
                calendar.push({
                    serviceId: data.service_id,
                    weekdays: weekdays,
                    startDate: parseDate(data.start_date),
                    endDate: parseDate(data.end_date) + 24 * 3600
                });
            })
            .on('end', () => {
                calendar = calendar.sort((a, b) => a.serviceId.localeCompare(b.serviceId));
                if (includeExceptions) {
                    readExceptions(gtfsPath).then(exceptions => {
                        for (let c of calendar) {
                            c.exceptions = exceptions[c.serviceId] || [];
                        }
                        resolve(calendar);
                    });
                } else {
                    resolve(calendar);
                }
            });
    });
}
exports.readCalendar = readCalendar;
