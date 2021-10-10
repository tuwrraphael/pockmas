const { readStops } = require("./read-stops.js");
const levenshtein = require("js-levenshtein");
const { coordinateDistance } = require("./coordinate-distance");
const fs = require("fs");
const possibleTypos = require("./possible-typos");

const maxDistance = 0.4;
const maxEditDistance = 0.2;
const resultsPerNode = 10;
const maxTypos = 3;
const stopIdSize = 16;


function getCanonicalName(stopGroup) {
    return stopGroup.cleanedName.replace(/\s+/g, "");
}

class TrieNode {
    static numNodes = 0;
    static numResultValues = 0;
    static alphabet = [];
    static trieSize = 0;

    static lastIndex = 0;
    static allNodes = [];

    constructor(stopGroups) {
        this.index = TrieNode.lastIndex;
        TrieNode.lastIndex++;
        TrieNode.allNodes.push(this);

        TrieNode.numNodes++;
        if (stopGroups.length > resultsPerNode) {

            let possibleChildren = {};
            for (let stopGroup of stopGroups) {
                if (stopGroup.typos >= maxTypos) {
                    continue;
                }
                let canonicalName = getCanonicalName(stopGroup.group);
                if (canonicalName.length < stopGroup.level + 1) {
                    continue;
                }
                let firstLetter = canonicalName[stopGroup.level];
                possibleChildren[firstLetter] = possibleChildren[firstLetter] || [];
                possibleChildren[firstLetter].push({
                    group: stopGroup.group,
                    typos: stopGroup.typos,
                    level: stopGroup.level + 1
                });
                for (let letter of (possibleTypos[firstLetter] || [])) {
                    possibleChildren[letter] = possibleChildren[letter] || [];
                    possibleChildren[letter].push({
                        group: stopGroup.group,
                        typos: stopGroup.typos + 1,
                        level: stopGroup.level + 1
                    });
                }
                if (canonicalName.length < stopGroup.level + 2) {
                    continue;
                }
                let secondLetter = canonicalName[stopGroup.level + 1];
                possibleChildren[secondLetter] = possibleChildren[secondLetter] || [];
                possibleChildren[secondLetter].push({
                    group: stopGroup.group,
                    typos: stopGroup.typos + 1,
                    level: stopGroup.level + 2
                });
            }
            this.children = {};
            for (let letter in possibleChildren) {
                this.children[letter] = new TrieNode(possibleChildren[letter]);
                if (TrieNode.alphabet.indexOf(letter) < 0) {
                    TrieNode.alphabet.push(letter);
                }
            }
        }
        else {
            this.children = {};
        }
        this.value = stopGroups.sort((a, b) => {
            if (a.typos == 0 && b.typos > 0) {
                return -1;
            } else if (a.typos > 0 && b.typos == 0) {
                return 1;
            }
            else {
                return b.group.popularity - a.group.popularity;
            }
        }).map(g => g.group).slice(0, resultsPerNode);
        TrieNode.numResultValues += this.value.length;
        TrieNode.trieSize += ((16 + 16 + 32 + 32) / 8) + Object.keys(this.children).length * ((32 + 8) / 8);

    }

    static getBinary() {
        let trieoutput = new Uint8Array(12 * TrieNode.allNodes.length);
        let childrenIndexSize = TrieNode.allNodes.reduce((acc, node) => {
            return acc + Object.keys(node.children).length;
        }, 0);
        let resultsSize = TrieNode.allNodes.reduce((acc, node) => {
            return acc + node.value.length;
        }, 0);
        let resultsOutput = new Uint8Array(resultsSize * 2);
        let childrenIndexOutput = new Uint8Array(childrenIndexSize * 4);
        let childrenLookupOutput = new Uint8Array(childrenIndexSize);
        let childrenIndex = 0;
        let resultsIndex = 0;
        let childrenIndexView = new DataView(childrenIndexOutput.buffer);
        let childrenLookupView = new DataView(childrenLookupOutput.buffer);
        for (let node of TrieNode.allNodes) {
            let entries = Object.entries(node.children).sort(([letter,], [letter2,]) => letter.charCodeAt(0) - letter2.charCodeAt(0));
            let trieView = new DataView(trieoutput.buffer, 12 * node.index, 12);
            trieView.setUint16(0, entries.length, true);
            trieView.setUint16(2, node.value.length, true);
            trieView.setUint32(4, childrenIndex, true);
            trieView.setUint32(8, resultsIndex, true);
            for (let [letter, child] of entries) {
                childrenIndexView.setUint32(childrenIndex * 4, child.index, true);
                childrenLookupView.setUint8(childrenIndex, letter.charCodeAt(0), true);
                childrenIndex++;
            }
            let resultsView = new DataView(resultsOutput.buffer, resultsIndex * 2, node.value.length * 2);
            for (let [idx, stopGroup] of Object.entries(node.value)) {
                resultsView.setUint16(2 * idx, stopGroup.stopGroupIdx, true);
                resultsIndex++;
            }
        }
        let output = new Uint8Array(4 * 4 + trieoutput.length + childrenIndexOutput.length + childrenLookupOutput.length + resultsOutput.length);
        let view = new DataView(output.buffer);
        view.setUint32(0, trieoutput.length, true);
        view.setUint32(4, childrenLookupOutput.length, true);
        view.setUint32(8, childrenIndexOutput.length, true);
        view.setUint32(12, resultsOutput.length, true);
        output.set(trieoutput, 4 * 4);
        output.set(childrenLookupOutput, 4 * 4 + trieoutput.length);
        output.set(childrenIndexOutput, 4 * 4 + trieoutput.length + childrenLookupOutput.length);
        output.set(resultsOutput, 4 * 4 + trieoutput.length + childrenLookupOutput.length + childrenIndexOutput.length);
        return output;
    }
}

async function createSearchIndex(gtfsPath) {
    const stops = await readStops(gtfsPath);
    const popularity = (await fs.promises.readFile("stop-popularity.txt", "utf8")).split("\n").map(n => parseInt(n));
    for (let stop of stops) {
        stop.cleanedName = stop.name
            .replace(/\bU\b/g, "")
            .replace(/\bS\+U\b/g, "")
            .replace(/\bS\b/g, "")
            .toLowerCase()
            .replace(/ä/g, "a")
            .replace(/ö/g, "o")
            .replace(/ü/g, "u")
            .replace(/ß/g, "ss")
            .replace(/[^a-z0-9]/g, " ")
            .replace(/ +(?= )/g, '')
            .trim()
    }
    let done = new WeakMap();
    let groupedStops = [];
    let stopGroupIdx = 0;
    for (let [stopAIndex, stopA] of stops.entries()) {
        if (done.has(stopA)) {
            continue;
        }
        for (let [stopBIndex, stopB] of stops.entries()) {
            if (stopA == stopB || !done.has(stopB)) {
                continue;
            }
            let editDistance = levenshtein(stopA.cleanedName, stopB.cleanedName) / Math.max(stopA.cleanedName.length, stopB.name.length);
            if (editDistance < maxEditDistance) {
                let distance = coordinateDistance(stopA.lat, stopA.lon, stopB.lat, stopB.lon);
                if (distance < maxDistance) {
                    let stopGroup = done.get(stopB);
                    stopGroup.groupedStops.push({ ...stopA, idx: stopAIndex });
                    done.set(stopA, stopGroup);
                    break;
                }
            }
        }
        if (!done.has(stopA)) {
            let stopGroup = {
                ...stopA,
                stopGroupIdx: stopGroupIdx,
                idx: stopAIndex,
                groupedStops: []
            };
            stopGroupIdx++;
            groupedStops.push(stopGroup);
            done.set(stopA, stopGroup);
        }
    }
    console.log(`Found ${groupedStops.length} stop groups`);
    for (let g of groupedStops) {
        g.popularity = g.groupedStops.reduce((acc, stop) => {
            return acc + popularity[stop.idx];
        }, 0);
        g.name = [g.name, ...g.groupedStops.map(s => s.name)].sort((a,b) => a.length - b.length)[0];
    }
    let root = new TrieNode(groupedStops.map(g => ({ group: g, typos: 0, level: 0 })));
    console.log(`Alphabet size: ${TrieNode.alphabet.length}`);
    console.log("Alphabet", TrieNode.alphabet.sort((a, b) => a.localeCompare(b)));
    console.log(`Trie will take up ${TrieNode.trieSize / (1024 * 1024)} MB of space.`)
    console.log(`Result list will take up ${Math.ceil(TrieNode.numResultValues * stopIdSize / 8 / (1024 * 1024))} MB of space.`);
    let destination = await fs.promises.open("stop_search.bin", "w");
    let binary = TrieNode.getBinary();
    await destination.write(binary);
    destination.close();
    await fs.promises.writeFile("stopgroupnames.txt", groupedStops.map(g => g.name).join("\n"));
}

// async function concatResults() {

//     let files = ["stop_search_trie.bin", "stop_search_trie_children.bin", "stop_search_trie_children_index.bin", "stop_search_trie_results.bin"];
//     let sizes = [];
//     for (let file of files) {
//         let stat = await fs.promises.stat(file);
//         sizes.push(stat.size);
//     }
//     destination.write(new Uint8Array(new Uint32Array(sizes).buffer));
//     for (let file of files) {
//         let binary = await fs.promises.readFile(file);
//         destination.write(new Uint8Array(binary));
//     }
//     destination.close();
// }

createSearchIndex("./gtfs").catch(console.error);