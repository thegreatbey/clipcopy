// Prepend a shebang to dist/cli.js if missing
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "dist", "cli.js");
if (!fs.existsSync(file)) {
  console.error("add-shebang: dist/cli.js not found. Did you run `npm run build`?");
  process.exit(1);
}

const src = fs.readFileSync(file, "utf8");
if (src.startsWith("#!")) {
  console.log("add-shebang: shebang already present.");
  process.exit(0);
}

const shebang = "#!/usr/bin/env node\n";
fs.writeFileSync(file, shebang + src, "utf8");
console.log("add-shebang: shebang added to dist/cli.js");