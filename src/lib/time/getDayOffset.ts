export function getDayOffset(reference: { unixTime: number; }, date: Date) {
    return Math.floor((date.getTime() - reference.unixTime) / 86400000);
}
