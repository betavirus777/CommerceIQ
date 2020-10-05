const express = require('express')
const _ = require('lodash');

module.exports.createRouteSingular = (db, name, opts) => {
  console.log( db.get(name).value());
  const router = express.Router();

  function show(req, res, next) {
    res.locals.data = db.get(name).value();
    next()
  }

  function create(req, res, next) {
   
    db.set(name, req.body).value()
    res.locals.data = db.get(name).value()
    

    res.status(201)
    next()
  }

  function update(req, res, next) {
    
    if (req.method === 'PUT') {
    db.set(name, req.body).value()
    } else {
    db.get(name)
        .assign(req.body)
        .value()
    }

    res.locals.data = db.get(name).value()
    

    next()
  }

  const w = write(db)

  router
    .route('/')
    .get(show)
    .post(create, w)
    .put(update, w)
    .patch(update, w)

  return router
}


module.exports.createRoutes = (db, name, opts) => {
    // Create router
    opts = {};
    const router = express.Router()
   
    function list(req, res, next) {
      // Resource chain
      let chain = db.get(name)
    
      let q = req.query.q
      const _sort = req.query._sort
      const _order = req.query._order
     
      delete req.query.q
      delete req.query._sort
      delete req.query._order

  
      if (q) {
        // Full-text search
        // if (Array.isArray(q)) {
        //   q = q[0]
        // }
  
        q = q.toLowerCase()
  
        chain = chain.filter(obj => {
          for (const key in obj) {
            const value = obj[key]
            if (db._.deepQuery(value, q)) {
              return true
            }
          }
        })
      }
  
      Object.keys(req.query).forEach(key => {
        //Remove invaid fields from this
        if (key !== null && key !== '') {
          // Always use an array, in case req.query is an array
          const arr = [].concat(req.query[key])
  
          let isDifferent = true;
          const path = key
  
          chain = chain.filter(element => {
            return arr
              .map(function(value) {
                //Get data-set value
                const elementValue = _.get(element, path)
                // Prevent toString() failing on undefined or null values
                if (elementValue === undefined || elementValue === null) {
                  return
                }else{
                    return value === elementValue.toString()
                }
              })
              .reduce((a, b) => (isDifferent ? a && b : a || b))
          })
        }
      })
  
      // Sort
      if (_sort) {
        const _sortSet = _sort.split(',')
        const _orderSet = (_order || '').split(',').map(s => s.toLowerCase())
        chain = chain.orderBy(_sortSet, _orderSet)
      }
  
      res.locals.data = chain.value()
      next()
    }
  
    // GET /name/:id
    // GET /name/:id?_embed=&_expand
    function show(req, res, next) {
    
      const resource = db
        .get(name)
        .getById(req.params.id)
        .value()
  
      if (resource) {
        // Clone resource to avoid making changes to the underlying object
        const clone = _.cloneDeep(resource)
        res.locals.data = clone
      }
  
      next()
    }
  
    // POST /name
    function create(req, res, next) {
      let resource
    
      resource = db
        .get(name)
        .insert(req.body)
        .value()
      

      res.status(201)
      res.locals.data = resource
  
      next()
    }
  
    // PUT /name/:id
    // PATCH /name/:id
    function update(req, res, next) {
        const id = req.params.id
        let resource
  
   
        let chain = db.get(name)

        chain =
            req.method === 'PATCH'
            ? chain.updateById(id, req.body)
            : chain.replaceById(id, req.body)

        resource = chain.value()
      
  
        if (resource) {
            res.locals.data = resource
        }
  
        next()
    }
  
    // DELETE /name/:id
    function destroy(req, res, next) {
      let resource
  
   
        resource = db
            .get(name)
            .removeById(req.params.id)
            .value()
      
  
      if (resource) {
        res.locals.data = {}
      }
  
      next()
    }
  
    const w = write(db)
  
    router
      .route('/')
      .get(list)
      .post(create, w)
  
    router
      .route('/:id')
      .get(show)
      .put(update, w)
      .patch(update, w)
      .delete(destroy, w)
  
    return router
}

function write(db) {
    return (req, res, next) => {
      db.write()
      next()
    }
}