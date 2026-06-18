const fs = require("fs");
const path = require("path");

// Load environment variables from a configurable file path (if specified via ENV_FILE_PATH).
// This avoids hard-coding a specific env file path so that the project remains git-friendly
// (e.g., .env* files are gitignored) and deployment platforms can inject variables directly.
const envFilePath = process.env.ENV_FILE_PATH;

if (envFilePath) {
  const resolvedPath = path.resolve(__dirname, envFilePath);
  if (fs.existsSync(resolvedPath)) {
    const envContent = fs.readFileSync(resolvedPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
    console.log(`✅ Loaded environment variables from ${resolvedPath}`);
  } else {
    console.warn(`⚠️  ENV_FILE_PATH specified but file not found: ${resolvedPath}`);
  }
} else {
  console.log("ℹ️  No ENV_FILE_PATH set; relying on system environment variables.");
}

// Start the standalone server
require("./.next/standalone/server.js");