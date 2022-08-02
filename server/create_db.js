const fs = require('fs');
const path = require('path');
const sqlite = require('better-sqlite3');
const db = new sqlite(path.resolve('drawings.db'), {fileMustExist: false});

let create_tables = `
CREATE TABLE finished (
id INTEGER PRIMARY KEY AUTOINCREMENT,
parts text,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE process (
id INTEGER PRIMARY KEY AUTOINCREMENT,
parts text,
editor_id text
);
`

db.exec(create_tables);

let dir = path.resolve("./parts")
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
