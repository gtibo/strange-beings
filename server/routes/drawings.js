const express = require('express');
const router = express.Router();
const path = require('path');

const {
  getMultiple,
  toComplete,
  startNewBeing,
  addToBeing,
  freeBeing,
  forceFreeBeing,
  maxPage
} = require('../services/drawings');

const multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, path.join(__dirname, "..", 'parts'));
  },
  filename: function(req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    callback(null, `${uniqueSuffix}.png`);
  }
});
const upload = multer({
  storage: storage
});

const watcher = new Map();

function addWatcher(drawing_id, editor_id) {
  watcher.set(drawing_id, setTimeout(() => {
    // User took too long, force free the drawing
    forceFreeBeing(drawing_id);
  }, 600000))
}

function removeWatcher(drawing_id) {
  if (!watcher.has(drawing_id)) return;
  clearTimeout(watcher.get(drawing_id));
  watcher.delete(drawing_id);
}



router.get('/page/:id', function(req, res, next) {
  try {
    res.json(getMultiple(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.get('/count', function(req, res, next) {
  try {
    res.json(maxPage());
  } catch (err) {
    next(err);
  }
});

router.get("/request", function(req, res, next) {
  try {
    let editor_data = toComplete();
    if (editor_data) addWatcher(editor_data?.drawing_id, editor_data?.editor_id);
    res.json(editor_data);
  } catch (err) {
    next(err);
  }
});

router.post("/cancel", function(req, res, next) {
  try {
    let editor_data = req.body.editor_data;
    freeBeing(editor_data.drawing_id, editor_data.editor_id);
    removeWatcher(editor_data.drawing_id);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

router.post('/send', upload.single("picture"), function(req, res, next) {
  try {
    let editor_data = JSON.parse(req.body.editor_data),
      filepath = path.join("/parts", req.file.filename);
    if (editor_data == null) {
      startNewBeing(filepath);
    } else {
      var is_null = addToBeing(editor_data.drawing_id, editor_data.editor_id, filepath);
      if (is_null == null) throw "User can't edit this being";
      removeWatcher(editor_data.drawing_id);
    }
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
})

module.exports = router;
