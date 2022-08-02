const express = require('express');
const router = express.Router();
const path = require('path');

const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const {
  deleteBeing,
  restartBeing
} = require('../services/drawings');


router.post("/login", async (req, res) => {
  if (!req.body.password) return res.status(404);
  // Check if password is right?
  // Send access token
  try {
    if (await bcrypt.compare(req.body.password, process.env.PASSWORD)) {
      const accessToken = jwt.sign(req.body.password, process.env.ACCESS_TOKEN)
      res.json({
        accessToken
      });
    } else {
      res.sendStatus(500);
    }
  } catch {
    res.sendStatus(500);
  }
});

router.delete("/deleteDrawing/:id", authenticateToken, (req, res, next) => {
  try {
    deleteBeing(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

router.get("/restartDrawing/:id/:part_index", authenticateToken, (req, res, next) => {
  try {
    restartBeing(req.params.id, req.params.part_index);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  // check token
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, password) => {
    if (err) return res.sendStatus(403);
    next();
  });
}


module.exports = router;
