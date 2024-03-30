import fs from "fs";
import path from "path";
import https from "https";

import * as core from "@actions/core";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const userAgentHeader = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
};

const axiosInstance = axios.create({
  timeout: 50000,
  httpsAgent: new https.Agent({ keepAlive: true }),
  headers: userAgentHeader,
});

const whiteList = () => {
  const whiteList = process.env.WHITE_LIST || core.getInput("white_list") || "";
  return whiteList.split(",");
}
const directoryPath = process.env.CHECK_PATH || core.getInput("check_path");
const fileFormat = () => {
  const formats =
    process.env.CHECK_FORMAT ||
    core.getInput("formats") ||
    "jpg,jpeg,png,gif,webp";
  return formats.split(",").join("|");
};

async function parseFiles(filePath) {
  let isValid = true;

  try {
    const files = await fs.promises.readdir(filePath);
    for (const file of files) {
      const fullPath = path.join(filePath, file);
      const stats = await fs.promises.stat(fullPath);

      if (stats.isFile()) {
        const fileValid = await parseFile(fullPath);
        isValid = isValid && fileValid;
      } else if (stats.isDirectory()) {
        const directoryValid = await parseFiles(fullPath);
        isValid = isValid && directoryValid;
      }
    }
  } catch (err) {
    console.error(err);
  }

  return isValid;
}

async function parseFile(filePath) {
  let isValid = true;

  try {
    const content = await fs.promises.readFile(filePath, "utf8");
    const imageUrlRegex = new RegExp(
      `https?:\\/\\/[\\w\\-\\.\\/\\?#&+%]*\\.(${fileFormat()})[\\w\\-\\.\\/\\?#&+%=]*`,
      "gi"
    );

    const matches = content.match(imageUrlRegex);
    if (matches) {
      for (const match of matches) {
        await axiosInstance.get(match).catch((error) => {
          if (whiteList().includes(match)) { 
            console.log(`WARNING: URL ${match} is in white list, bypassing check rule.`);
          } else {
            console.error(`Error: ${match}, in file: ${filePath}`);
            isValid = false;
          }
        });
      }
    }
  } catch (error) {
    console.error(error);
  }

  return isValid;
}

(async () => {
  const result = await parseFiles(directoryPath);
  if (!result) {
    const msg = "Some images are not accessible.";
    core.setFailed(msg);
  }
})();
