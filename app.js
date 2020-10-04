var express = require('express');
var app = express();
const bodyParser = require('body-parser');

bodyParser.json({ limit: '5mb', extended: false });
bodyParser.urlencoded({ extended: false });

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});