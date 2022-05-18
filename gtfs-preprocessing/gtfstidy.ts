import { boundingBoxString } from "./config/bounding-box";
import { exec } from "child_process";
export async function gtfsTidy(pathToGtfsTidyExecutable: string, gtfsDirs: string[], gtfsOutDir: string) {
    let args = [
        "-O",
        "-C",
        "-c",
        "-o",
        gtfsOutDir,
    ];
    for (let dir of gtfsDirs) {
        args.push(dir);
    }
    args.push("--bounding-box", boundingBoxString);
    console.log(`Running ${pathToGtfsTidyExecutable} ${args.join(" ")}`);
    await new Promise<void>((resolve, reject) => {
        exec(`${pathToGtfsTidyExecutable} ${args.join(" ")}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}