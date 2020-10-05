const express = require('./express');
const chalk = require('chalk');

module.exports.init = function init(callback){
    const db = "store.json";
    var app = express.init(db)
    if(callback) callback(app,db);
}
module.exports.start = function start(callback) {
    var _this = this;
  
    _this.init(function (app, db) {
  
      // Start the app by listening on <port> at <host>
      app.listen(3000, function () {
       // Logging initialization
        console.log('--');
        console.log(chalk.green("Commerce IQ"));
        console.log(chalk.green('Environment:     ' + process.env.NODE_ENV));
        console.log('--');
      });
  
    })
}