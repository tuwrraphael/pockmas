
export class StopGroupStore {
    constructor(private sstopGroupIndex: { name: string; stopIds: number[]; }[]) {
    }

    getStopGroup(stopGroupId: number): { name: string; stopIds: number[]; } {
        if (stopGroupId > this.sstopGroupIndex.length) {
            throw new Error(`Invalid stop group id ${stopGroupId}`);
        }
        return this.sstopGroupIndex[stopGroupId];
    }

    findByStopId(stopId: number): { id: number; name: string; } {
        let found = this.sstopGroupIndex.find(s => s.stopIds.includes(stopId));
        if (null == found) {
            return null;
        }
        return { id: found.stopIds.indexOf(stopId), name: found.name };
    }
}
