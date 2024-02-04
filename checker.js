import fs from "fs";
import path from "path";

import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const directoryPath = process.env.CHECK_PATH;
const fileFormat = () => {
  const formats = process.env.CHECK_FORMAT || "jpg,jpeg,png,gif,webp";
  return formats.split(",").join("|");
};

function parseFiles(filePath) {
  let isValid = true;

  fs.readdir(filePath, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach((file) => {
      const fullPath = path.join(filePath, file);
      fs.stat(fullPath, (err, stats) => {
        if (err) {
          console.error(err);
          return;
        }

        if (stats.isFile()) {
          isValid = isValid && parseFile(fullPath);
        } else if (stats.isDirectory()) {
          isValid = isValid && parseFiles(fullPath);
        }
      });
    });
  });

  return isValid;
}

function parseFile(filePath) {
  let isValid = true;

  fs.readFile(filePath, "utf8", (err, content) => {
    if (err) {
      console.error(err);
      return;
    }

    content.split(/\r?\n/).forEach((line) => {
      const imageUrlRegex = new RegExp(
        `https?:\\/\\/[\\w\\-\\.\\/\\?#&+%]*\.(${fileFormat()})`,
        "gi"
      );

      const matches = line.match(imageUrlRegex);
      if (matches) {
        matches.forEach(async (match) => {
          axios
            .get(match)
            .then((response) => {
              if (response.status !== 200) {
                console.error(`${response.status}: ${match}`);
                isValid = false;
              }
            })
            .catch((error) => {
              console.error(`Error: ${match}, in file: ${filePath}`);
              isValid = false;
            });
        });
      }
    });
  });

  return isValid;
}

if (parseFiles(directoryPath) !== 0) {
  const msg = "Some images are not accessible.";
  console.error(msg);
  core.setFailed(msg);
}
