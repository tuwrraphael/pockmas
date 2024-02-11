import { MAX_REQUEST_STATIONS } from "../raptor/config";

describe("raptor data validation", () => {
    let stopgroupIndex: { name: string, stopIds: number[] }[];

    beforeEach(async () => {
        stopgroupIndex = await (await fetch(new URL("../preprocessing-dist/stopgroup-index.json", import.meta.url).toString())).json();
    });

    it("ensure maxium stopgroup size", () => {
        for (const stopgroup of stopgroupIndex) {
            expect(stopgroup.stopIds.length).toBeLessThanOrEqual(MAX_REQUEST_STATIONS);
        }
    });

});