const db = require('../services/db');
const config = require('../config');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

function getMultiple(page = 0) {
  const offset = page * config.listPerPage;
  const data = db.query(`SELECT * FROM finished ORDER BY id DESC LIMIT ?,?`, [offset, config.listPerPage]);

  let drawings = data.map(drawing => {
    drawing.parts = drawing.parts.split(",");
    return drawing;
  });

  const meta = {
    page
  };
  return {
    drawings,
    meta
  }
}

function maxPage() {
  let {
    count
  } = db.findOne(`SELECT COUNT(*) count FROM finished`);
  return {
    count: Math.max(0, Math.floor((count-1) / config.listPerPage))
  };
}

// Find a drawing in process that can be completed
// Return null if found nothing
// Otherwise, return a drawing_process_id and editor_id
function toComplete() {
  let found_document = db.findOne(`SELECT * FROM process WHERE editor_id is NULL`);
  if (found_document == undefined) return null;
  let drawing_id = found_document.id;
  let editor_id = crypto.randomUUID();
  db.run(`UPDATE process SET editor_id = ? WHERE id = ?`, [editor_id, drawing_id])
  let parts_list = found_document.parts.split(",");
  return {
    editor_id,
    drawing_id,
    parts_count: parts_list.length,
    last_part: parts_list.pop()
  }
}

function forceFreeBeing(drawing_id) {
  db.run('UPDATE process SET editor_id = NULL WHERE id = ?', [drawing_id]);
}

function freeBeing(drawing_id, editor_id) {
  db.run('UPDATE process SET editor_id = NULL WHERE id == ? AND editor_id == ?', [drawing_id, editor_id]);
}

function startNewBeing(filepath) {
  db.run('INSERT INTO process (parts) VALUES (?)', [filepath]);
}

function deleteBeing(drawing_id) {
  let document_data = db.findOne(`SELECT * FROM finished WHERE id = ?`, [drawing_id]);
  if (document_data == undefined) throw "no document found...";
  let parts = document_data.parts.split(",");
  parts.forEach(part => {
    let part_path = path.join("./", part);
    if (fs.existsSync(part_path)) fs.unlinkSync(part_path);
  })
  db.run('DELETE FROM finished WHERE id = ?', [drawing_id]);
}


function restartBeing(drawing_id, part_index) {
  let document_data = db.findOne(`SELECT * FROM finished WHERE id = ?`, [drawing_id]);
  if (document_data == undefined) throw "no document found...";
  let parts = document_data.parts.split(",");
  let parts_to_delete = parts.splice(parseInt(part_index) + 1);
  parts_to_delete.forEach(part => {
    let part_path = path.join("./", part);
    if (fs.existsSync(part_path)) fs.unlinkSync(part_path);
  })
  db.run('DELETE FROM finished WHERE id = ?', [drawing_id]);
  // Push drawing back in process stack
  db.run('INSERT INTO process (parts) VALUES (?)', [parts.toString()]);
}


function addToBeing(drawing_id, editor_id, filepath) {
  let found_document = db.findOne(`SELECT * FROM process WHERE id == ? AND editor_id == ?`, [drawing_id, editor_id]);
  if (found_document == undefined) return null;
  let parts = found_document.parts.split(",");
  parts.push(filepath);
  if (parts.length >= 3) {
    db.run('DELETE FROM process WHERE id = ?', [drawing_id]);
    // Push drawings in finished stack
    db.run('INSERT INTO finished (parts) VALUES (?)', [parts.toString()]);
  } else {
    // Update
    db.run('UPDATE process SET editor_id = NULL, parts = ? WHERE id = ?', [parts.toString(), drawing_id]);
  }
  return true;
}

module.exports = {
  getMultiple,
  toComplete,
  startNewBeing,
  addToBeing,
  freeBeing,
  forceFreeBeing,
  maxPage,
  deleteBeing,
  restartBeing
}
