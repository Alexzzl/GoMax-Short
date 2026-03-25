import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const rootDir = process.cwd();
const legacyMockFile = path.join(rootDir, "js", "data", "mock.js");
const outputFile = path.join(rootDir, "src", "data", "mock-data.generated.ts");

const source = fs.readFileSync(legacyMockFile, "utf8");
const sandbox = {
  window: {},
  console
};

vm.runInNewContext(source, sandbox, {
  filename: legacyMockFile
});

const legacyData = sandbox.window.MockData;

if (!legacyData) {
  throw new Error("Unable to load legacy mock data from js/data/mock.js");
}

const generatedSource = `/* eslint-disable */
/* auto-generated from js/data/mock.js. do not edit manually. */

export const generatedCategories = ${JSON.stringify(legacyData.categories, null, 2)} as const;

export const generatedHeroItems = ${JSON.stringify(legacyData.heroItems, null, 2)} as const;

export const generatedDramas = ${JSON.stringify(legacyData.dramas, null, 2)} as const;
`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, generatedSource, "utf8");
