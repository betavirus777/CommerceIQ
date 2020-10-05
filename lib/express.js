const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const lodashId = require('lodash-id');


//Low DB
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const db = "store.json";
const dbInstance = low(new FileSync(db));

// const cors = require('cors');

module.exports.initLocalVariables = function (app) {
    app.locals.data = {};
}

module.exports.initMiddleware = function (app) {

    //Body Parser
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    // app.use(methodOverride());

}

module.exports.initErrorRoutes = function (app) {
    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        if (!err) {
            return next();
        }
        if (err.name === 'UnauthorizedError') {
            res.status(401).json({"message" : err.name + ": " + err.message,"error":true,"type":"Authentication"});

        }
    });
};

module.exports.init = function (db) {
    // Initialize express app
    var app = express();

    // Initialize local variables
    this.initLocalVariables(app);

    // Initialize Express middleware
    this.initMiddleware(app);

    // app.use(cors())
    dbInstance._.mixin(lodashId);

    //Expose Render
 
    var route = require('./routes')(app, dbInstance);

    this.initErrorRoutes(app);

    return app;
};