import path from "path";
import fs from "fs/promises";

export async function fixTimeZones(gtfsDir: string) {
    let agenciesFile = path.join(gtfsDir, "agency.txt");
    let text = await fs.readFile(agenciesFile, "utf8");
    console.log(`Fixing timezones in ${agenciesFile}`);
    text = text.replace(/Europe\/Berlin/g, "Europe/Vienna");
    await fs.writeFile(agenciesFile, text);
}