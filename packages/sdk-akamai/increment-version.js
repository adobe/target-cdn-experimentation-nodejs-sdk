import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "demo", "bundle.json");
const envFilePath = path.join(__dirname, ".env");

// Read and update the bundle.json
const bundle = JSON.parse(fs.readFileSync(filePath, "utf8"));
const versionParts = bundle["edgeworker-version"].split(".");
versionParts[1] = (parseInt(versionParts[1], 10) + 1).toString();
bundle["edgeworker-version"] = versionParts.join(".");

fs.writeFileSync(filePath, JSON.stringify(bundle, null, 2), "utf8");
console.log(`Updated edgeworker-version to ${bundle["edgeworker-version"]}`);

// Read and update the .env file
const envFileContent = fs.readFileSync(envFilePath, "utf8");
const updatedEnvFileContent = envFileContent.replace(
  /EDGEWORKER_VERSION=.*/,
  `EDGEWORKER_VERSION=${bundle["edgeworker-version"]}`,
);
fs.writeFileSync(envFilePath, updatedEnvFileContent, "utf8");
console.log(
  `Set EDGEWORKER_VERSION to ${bundle["edgeworker-version"]} in .env file`,
);
