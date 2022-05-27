import { GtfsStop, readStops } from "./read-stops.js";
import levenshtein from "js-levenshtein";
import { coordinateDistance } from "./coordinate-distance";
import fs from "fs";
import { possibleTypos } from "./possible-typos";
import path from "path";

const maxDistance = 0.4;
const maxEditDistance = 0.2;
const resultsPerNode = 10;
const maxTypos = 2;
const stopIdSize = 16;


function getCanonicalName(stopGroup: { cleanedName: string }) {
    return stopGroup.cleanedName.replace(/\s+/g, "");
}

interface GroupedStop extends GtfsStop {
    idx: number;
    cleanedName: string;
}

interface StopGroup {
    stopGroupIdx: number;
    groupedStops: GroupedStop[];
    popularity: number;
    cleanedName: string;
    name: string;
}

function canAddToStopGroup(group: StopGroup, stop: GroupedStop) {
    if (group.groupedStops.length == 0) {
        return true;
    }
    if (group.cleanedName.indexOf("hauptbahnhof") > -1 && stop.cleanedName.indexOf("hauptbahnhof") > -1) {
        return true;
    }
    for (let g of group.groupedStops) {
        if (coordinateDistance(g.lat, g.lon, stop.lat, stop.lon) > maxDistance) {
            return false;
        }
    }
    if (/(\d)\s+?tor/.test(group.cleanedName)) {
        if (!/(\d)\s+?tor/.test(stop.cleanedName)) {
            return false;
        } else {
            let tornr1 = parseInt((group.cleanedName.match(/(\d)\s+?tor/))![1]);
            let tornr2 = parseInt((stop.cleanedName.match(/(\d)\s+?tor/))![1]);
            if (tornr1 != tornr2){
                return false;
            }
        }
    }
    let editDistance = levenshtein(stop.cleanedName, group.cleanedName) / Math.max(stop.cleanedName.length, group.cleanedName.length);
    if (editDistance > maxEditDistance) {
        return false;
    }
    return true;
}

interface TrieNodeData {
    group: StopGroup;
    typos: number;
    level: number;
}

function samePossibleChildren(possibleChildrenA: TrieNodeData[], possibleChildrenB: TrieNodeData[]) {
    if (possibleChildrenA.length != possibleChildrenB.length) {
        return false;
    }
    for (let stopGroup of possibleChildrenA) {
        if (!possibleChildrenB.some(g =>
            g.group.stopGroupIdx == stopGroup.group.stopGroupIdx &&
            g.typos == stopGroup.typos &&
            g.level == stopGroup.level)) {
            return false;
        }
    }
    return true;
}

class TrieNode {

    private index: number;
    private value: StopGroup[];
    private children: { [letter: string]: TrieNode };

    static numNodes = 0;
    static numResultValues = 0;
    static alphabet: string[] = [];
    static trieSize = 0;

    static lastIndex = 0;
    static allNodes: TrieNode[] = [];


    constructor(stopGroups: TrieNodeData[]) {
        this.index = TrieNode.lastIndex;
        TrieNode.lastIndex++;
        TrieNode.allNodes.push(this);

        TrieNode.numNodes++;
        let sorted = stopGroups.sort((a, b) => {
            if (a.typos == 0 && b.typos > 0) {
                return -1;
            } else if (a.typos > 0 && b.typos == 0) {
                return 1;
            }
            else {
                return b.group.popularity - a.group.popularity;
            }
        });

        let allResults = sorted
            .filter((stopGroup, index) => index == sorted.findIndex(stopGroup2 => stopGroup2.group.stopGroupIdx == stopGroup.group.stopGroupIdx))
            .map(g => g.group)
        this.value = allResults.slice(0, resultsPerNode);
        TrieNode.numResultValues += this.value.length;
        if (allResults.length > resultsPerNode) {

            let possibleChildren: { [letter: string]: TrieNodeData[] } = {};
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
            let done = new Set();
            for (let letter in possibleChildren) {
                if (done.has(letter)) {
                    continue;
                }
                done.add(letter);
                this.children[letter] = new TrieNode(possibleChildren[letter]);
                if (TrieNode.alphabet.indexOf(letter) < 0) {
                    TrieNode.alphabet.push(letter);
                    done.add(letter);
                }
                for (let letter2 in possibleChildren) {
                    if (samePossibleChildren(possibleChildren[letter], possibleChildren[letter2])) {
                        this.children[letter2] = this.children[letter];
                        if (TrieNode.alphabet.indexOf(letter2) < 0) {
                            TrieNode.alphabet.push(letter2);
                        }
                        done.add(letter2);
                    }
                }
            }
        }
        else {
            this.children = {};
        }
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
                childrenLookupView.setUint8(childrenIndex, letter.charCodeAt(0));
                childrenIndex++;
            }
            let resultsView = new DataView(resultsOutput.buffer, resultsIndex * 2, node.value.length * 2);
            for (let [idx, stopGroup] of Object.entries(node.value)) {
                resultsView.setUint16(2 * parseInt(idx), stopGroup.stopGroupIdx, true);
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

export async function createSearchIndex(gtfsPath: string, outputPath: string) {
    const rawstops = await readStops(gtfsPath);
    const popularity = (await fs.promises.readFile(path.join(outputPath, "stop-popularity.txt"), "utf8")).split("\n").map(n => parseInt(n));
    let stops = rawstops.map(s => ({
        ...s, cleanedName: s.name
            .replace(/^Wien\s/ig, "")
            .replace(/\bbahnhof\b/ig, "")
            .replace(/\bbahnhst\b/ig, "")
            .replace(/\bhbf\b/ig, "Hauptbahnhof")
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
    }));
    let groupedStops: StopGroup[] = [];
    for (let [stopAIndex, stopA] of stops.entries()) {
        let candidate = { ...stopA, idx: stopAIndex };
        let added = false;
        for (let g of groupedStops) {
            if (canAddToStopGroup(g, candidate)) {
                g.groupedStops.push(candidate);
                added = true;
                break;
            }
        }
        if (added) {
            continue;
        }
        let stopGroup: StopGroup = {
            stopGroupIdx: 0,
            groupedStops: [candidate],
            name: stopA.name,
            popularity: 0,
            cleanedName: stopA.cleanedName
        };
        groupedStops.push(stopGroup);
    }
    console.log(`Found ${groupedStops.length} stop groups`);

    let grouped = groupedStops.map(g => ({
        ...g,
        popularity: g.groupedStops.reduce((acc, stop) => {
            return acc + popularity[stop.idx];
        }, 0),
        name: [g.name, ...g.groupedStops.map(s => s.name)].sort((a, b) => a.length - b.length)[0]
            .replace(/^Wien\s/ig, "")
            .replace(/\bhbf\b/ig, "Hauptbahnhof"),
    })).sort((a, b) => a.name.localeCompare(b.name));
    grouped = grouped.map((g, idx) => {
        g.stopGroupIdx = idx;
        return g;
    });

    let root = new TrieNode(grouped.map(g => ({ group: g, typos: 0, level: 0 })));
    console.log(`Alphabet size: ${TrieNode.alphabet.length}`);
    console.log("Alphabet", TrieNode.alphabet.sort((a, b) => a.localeCompare(b)));
    console.log(`Trie will take up ${TrieNode.trieSize / (1024 * 1024)} MB of space.`)
    console.log(`Result list will take up ${Math.ceil(TrieNode.numResultValues * stopIdSize / 8 / (1024 * 1024))} MB of space.`);
    let destination = await fs.promises.open(path.join(outputPath, "stop_search.bin.bmp"), "w");
    let binary = TrieNode.getBinary();
    await destination.write(binary);
    destination.close();
    let stopGroupIndex = grouped.map(g => ({ name: g.name, stopIds: [...g.groupedStops.map(s => s.idx)] }));
    await fs.promises.writeFile(path.join(outputPath, "stopgroup-index.json"), JSON.stringify(stopGroupIndex));
    await fs.promises.writeFile(path.join(outputPath, "stopgroups.txt"), grouped.map(g => `${g.name}\n${g.groupedStops.map(s => `+ ${s.name}`).join("\n")}`).join("\n\n"));
}