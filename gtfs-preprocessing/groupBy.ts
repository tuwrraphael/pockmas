
type EnsureIndexable<K> = K extends (number | string | symbol) ? K : never;

export function groupBy<T, K extends keyof T>(xs: T[], key: K) {
    // type TValue = TValueOf<T, K>;
    let initial = {} as any;
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, initial) as Record<EnsureIndexable<T[K]>, T[]>;
}