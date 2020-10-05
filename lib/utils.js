const express = require('express')
var _ = require('lodash');


module.exports.createRoutes = (db, name, opts) => {
    // Create router
    opts = {};
    const router = express.Router()
    function list(req, res, next) {
        // Resource chain
        let chain = db.get(name)
    
        let q = req.query.q
        const _sort = req.query._sort || 'asc';
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
                    if (search(value, q)) {
                        return true
                    }
                }
            })
        }
    
        Object.keys(req.query).forEach(key => {
            //Remove invaid fields from this
            if (key !== null && key !== '') {
                // Always use an array, in case req.query is an array
                const arr = [].concat(req.query[key]);
                const path = key
    
                chain = chain.filter(element => {
                    let vl = arr
                        .map(function (value) {
                            //Get data-set value
                            const elementValue = _.get(element, path)
                            //Hnadling Case for invalid key values
                            if (elementValue === undefined || elementValue === null) {
                                return
                            } else {
                                return value === elementValue.toString()
                            }
                        }).reduce((a, b) => a || b)
    
                    return vl;
                })
            }
        })
    
        // Sorting is here using
        if (_sort) {
            const _sortSet = _sort.split(',')
            const _orderSet = (_order || '').split(',').map(s => s.toLowerCase())
            // console.log(_sortSet)
            chain = chain.orderBy(_sortSet, _orderSet)
        }
    
        res.locals.data = chain.value()
        next()
    }
    
    
    function show(req, res, next) {
    
        const resource = db
            .get(name)
            .getById(req.params.id)
            .value()
    
        if (resource) {
    
            const clone = _.cloneDeep(resource)
            res.locals.data = clone
        }
    
        next()
    }
    
    
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
            res.locals.data = { "msg": `${req.params.id} removed Successfully`, error: false }
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

function search(value, q) {
    if (value && q) {

        if (
            value
                .toString()
                .toLowerCase()
                .indexOf(q) !== -1
        ) {
            return true
        }

    }
}
