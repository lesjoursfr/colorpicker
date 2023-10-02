import fs from "fs-extra";
import { resolve } from "path";
import tsConfig from "./tsconfig.json" assert { type: "json" };

const rootDir = resolve(tsConfig.compilerOptions.rootDir);
const outDir = resolve(tsConfig.compilerOptions.outDir);

function copyAssets(fromDir, toDir) {
  if (fs.pathExistsSync(toDir)) {
    fs.emptyDirSync(toDir);
  } else {
    fs.ensureDirSync(toDir, { mode: 0o775 });
  }

  fs.copySync(fromDir, toDir);
}

copyAssets(resolve(rootDir, "css"), resolve(outDir, "css"));
