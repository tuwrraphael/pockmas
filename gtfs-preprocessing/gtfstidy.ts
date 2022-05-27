import { gtfsTidyboundingBoxString } from "./config/bounding-box";
import { exec } from "child_process";
export async function gtfsTidy(pathToGtfsTidyExecutable: string, gtfsDirs: string[], gtfsOutDir: string) {
    let options = [
        "-O",
        "-C",
        "-c",
        "--explicit-calendar"
    ];
    let args = [
        ...options,
        "-o",
        gtfsOutDir,
    ];
    for (let dir of gtfsDirs) {
        args.push(dir);
    }
    args.push("--bounding-box", gtfsTidyboundingBoxString);
    console.log(`Running ${pathToGtfsTidyExecutable} ${args.join(" ")}`);
    await new Promise<void>((resolve, reject) => {
        exec(`${pathToGtfsTidyExecutable} ${args.join(" ")}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            else {
                console.log(stdout);
                resolve();
            }
        });
    });
}