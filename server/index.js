require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const drawingsRouter = require('./routes/drawings');
const adminRouter = require('./routes/admin');
const port = 3002;

app.use(cors());
app.use(express.json());
app.use("/", express.static(path.resolve("../", 'client/build')));

app.use("/parts", express.static('parts'));
app.use('/drawings', drawingsRouter);
app.use('/admin', adminRouter);
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).send('Something broke!');
});
app.listen(port);
