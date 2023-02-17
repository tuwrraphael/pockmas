
export function addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * 86400000);
}
