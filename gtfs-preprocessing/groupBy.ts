
type EnsureIndexable<K> = K extends (number | string | symbol) ? K : never;

export function groupBy<T, K extends keyof T>(xs: T[], key: K) {
    // type TValue = TValueOf<T, K>;
    let initial = {} as any;
    return xs.reduce(function (rv, x) {
        let keyValue = x[key];
        (rv[keyValue] = rv[keyValue] || []).push(x);
        return rv;
    }, initial) as Record<EnsureIndexable<T[K]>, T[]>;
}

export function groupByEquality<T, K>(xs: T[], key: (a: T) => K, equality: (a: K, b: K) => boolean) {
    let map: Map<K, T[]> = new Map();
    for (let x of xs) {
        let theKey = key(x);
        let groupKey = Array.from(map.keys()).find(k => equality(k, theKey));
        if (groupKey != undefined) {
            map.get(groupKey)!.push(x);
        } else {
            map.set(theKey, [x]);
        }
    }
    return map;
}