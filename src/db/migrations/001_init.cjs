
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const sql = readFileSync(
  join(__dirname, "../schema/001_init.sql"),
  "utf8"
);

const sections = sql.split(
  /^\s*-- (?:Up|Down) Migration\s*$/gm
);

if (sections.length !== 3) {
  throw new Error("Expected Up and Down Migration sections");
}

exports.up = (pgm) => {
  pgm.sql(sections[1]);
};

exports.down = (pgm) => {
  pgm.sql(sections[2]);
};
