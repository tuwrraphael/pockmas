import { exec } from "child_process";
import { env } from "process";

let pathToGtfsTidyExecutable = env.GTFSTIDY_EXECUTABLE || "gtfstidy";

export async function checkGtfsTidy(pathToGtfsTidyExecutable: string) {
    let options = [
        "--help"
    ];
    let args = [
        ...options
    ];
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

checkGtfsTidy(pathToGtfsTidyExecutable).catch(err => {
    console.error(err);
    process.exit(1);
});