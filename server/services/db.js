const sqlite = require('better-sqlite3');
const path = require('path');
const db = new sqlite(path.resolve('drawings.db'), {fileMustExist: true});

function query(sql, params = []) {
  return db.prepare(sql).all(params);
}

function findOne(sql, params = []){
  return db.prepare(sql).get(params);
}

function run(sql, params = []){
  return db.prepare(sql).run(params);
}

module.exports = {
  query,
  findOne,
  run
}
