const express = require('express')
const router = express.Router();

const _ = require('lodash');
const createRouteSingular = require('./utils').createRouteSingular;
const createRoutes = require('./utils').createRoutes;
module.exports = function(app , db){
   
   db.forEach((value, key) => {
    
    if (_.isPlainObject(value)) {    
        const catchRes = createRouteSingular(db, key);
        console.log(catchRes.route);
        router.use(`/${key}`,catchRes);
        return
    }

    if (_.isArray(value)) {
      console.log(value);
      router.use(`/${key}`, createRoutes(db, key))
      return
    }

    
  }).value();

  router.render = (req, res) => {
    res.jsonp(res.locals.data)
  }

  router.use((req, res) => {
    if (!res.locals.data) {
      res.status(400);
      res.locals.data = {}
    }

    router.render(req, res)
  })

  router.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send(err.stack)
  });

  
  
  app.use(router);

}