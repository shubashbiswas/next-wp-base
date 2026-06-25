const fs = require("fs");
const path = require("path");

// ─── Env file loader ────────────────────────────────────────

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const envContent = fs.readFileSync(filePath, "utf-8");
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
  console.log(`✅ Loaded environment variables from ${filePath}`);
  return true;
}

const envFilePath = process.env.ENV_FILE_PATH;
if (envFilePath) {
  const resolvedPath = path.resolve(__dirname, envFilePath);
  if (fs.existsSync(resolvedPath)) {
    loadEnvFile(resolvedPath);
  } else {
    console.warn(`⚠️  ENV_FILE_PATH specified but file not found: ${resolvedPath}`);
  }
} else {
  const defaultEnvPath = path.resolve(__dirname, ".env");
  if (fs.existsSync(defaultEnvPath)) {
    loadEnvFile(defaultEnvPath);
  } else {
    console.log("ℹ️  No ENV_FILE_PATH set and no .env file found; relying on system environment variables.");
  }
}

// ─── Ensure standalone assets are in place ──────────────────
// When using Next.js standalone output, the build generates:
//   .next/standalone/        ← self-contained server
//   .next/static/            ← JS/CSS chunks etc.
//   public/                  ← static assets
//
// The standalone server expects these at runtime alongside server.js,
// so we need to ensure they exist in the standalone directory.

const standaloneDir = path.resolve(__dirname, ".next/standalone");
const projectStaticDir = path.resolve(__dirname, ".next/static");
const standaloneStaticDir = path.resolve(standaloneDir, ".next/static");
const projectPublicDir = path.resolve(__dirname, "public");
const standalonePublicDir = path.resolve(standaloneDir, "public");

// Helper: sync a directory using symlinks when possible, copy as fallback
function syncDir(src, dest, label) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Source ${label} directory not found: ${src}`);
    return;
  }
  if (fs.existsSync(dest)) {
    console.log(`✓ ${label} already present in standalone directory`);
    return;
  }

  // Try symlink first (works on most Unix systems and avoids duplication)
  try {
    fs.symlinkSync(src, dest, "dir");
    console.log(`🔗 Symlinked ${label} into standalone directory`);
    return;
  } catch {
    // Symlink failed (e.g., cross-device, permission issue) — fall back to copy
  }

  // Recursive copy fallback
  function copyRecursive(from, to) {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      const srcPath = path.join(from, entry.name);
      const destPath = path.join(to, entry.name);
      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  try {
    copyRecursive(src, dest);
    console.log(`📁 Copied ${label} into standalone directory`);
  } catch (err) {
    console.warn(`⚠️  Failed to copy ${label} into standalone directory: ${err.message}`);
  }
}

syncDir(projectStaticDir, standaloneStaticDir, ".next/static");
syncDir(projectPublicDir, standalonePublicDir, "public");

// ─── Start the standalone server ────────────────────────────
require("./.next/standalone/server.js");