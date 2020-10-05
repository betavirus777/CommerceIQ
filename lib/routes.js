const express = require('express')
const router = express.Router();
const url = require('url');
const _ = require('lodash');
const createRoutes = require('./utils').createRoutes;
const handleRequest = require('./handleRequest').handleRequest;

function SyncManager(db){
    db.forEach((value, key) => {

        if (_.isArray(value)) {
          console.log(value);
          router.use(`/${key}`, createRoutes(db, key))
          return
        } 
      }).value();
    
}
module.exports = function(app , db){
   
  SyncManager(db)
 
  router.render = (req, res) => {
    res.jsonp(res.locals.data)
  }

  router.use((req, res) => {
    if (!res.locals.data) {
      let key = req.path;    
      key = key.split('/')[1];
      if(req.method == 'POST'){

        if(!db.has(key).value()){
            db.set(key, []).write()
            let resource = db
            .get(key)
            .insert(req.body)
            .write();
            res.locals.data = resource;
        }else{
            handleRequest(req, res, key, db);
        }
        
      }else if(db.has(key).value()){
        handleRequest(req, res, key, db);
      }else{
        res.status(404);
        res.locals.data = {};
      }
      
    }
    router.render(req, res)
  })

  router.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send(err.stack)
  });

  
  
  app.use(router);

}