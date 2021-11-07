export async function copyToWasmMemory<T extends WebAssembly.Exports & { memory: WebAssembly.Memory; }>(instance: WebAssemblyInstance<T>,
    res: Response,
    numSizes: number,
    getOffset: (instance: WebAssemblyInstance<T>, sizes: number[]) => number) {
    let reader = res.body.getReader();
    let done = false;
    let offset;
    let sizes = [];
    let sizesBuffer = new Uint8Array(numSizes * 4);
    let received = 0;
    while (!done) {
        let read = await reader.read();
        done = read.done;
        if (read.done) {
            break;
        }
        let data = read.value;

        if (sizes.length == 0) {
            sizesBuffer.set(data.slice(0, Math.min(4 * numSizes - received, data.byteLength)), received);
            received += data.byteLength;
            if (received < numSizes * 4) {
                continue;
            } else {
                let view = new DataView(sizesBuffer.buffer);
                for (let i = 0; i < numSizes; i++) {
                    sizes.push(view.getUint32(i * 4, true));
                }
                data = data.slice(numSizes * 4 - received);
            }
        }
        if (sizes.length > 0 && offset == undefined) {
            offset = getOffset(instance, sizes);
        }
        if (offset != undefined) {
            new Uint8Array(instance.exports.memory.buffer, offset, data.length).set(data);
            offset += data.length;
        }
    }
}
