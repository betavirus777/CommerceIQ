const _ = require('lodash');
module.exports.handleRequest = function (req, res, name, db) {
    if (req.method == 'GET') {
        let key = req.path;    
        key = key.split('/');
        if(key.length <= 2){
             list(req, res, name, db);
        }
        else{
            show(req, res, name, db, key[2]);
        }
    } else if (req.method == 'DELETE'){ 
        let key = req.path;    
        key = key.split('/');
        destroy(req, res, name, db, key[2])
    }
    else if (req.method == 'PUT' || req.method == 'PATCH'){
        let key = req.path;    
        key = key.split('/');
        update(req, res, name, db, key[2]);
    }else if(req.method == 'POST'){
        create(req, res, name, db);
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
function list(req, res, name, db) {
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

}


function show(req, res, name, db, id) {

    const resource = db
        .get(name)
        .getById(id)
        .value()

    if (resource) {

        const clone = _.cloneDeep(resource)
        res.locals.data = clone
    }

 
}


function create(req, res, name, db) {
    let resource

    resource = db
        .get(name)
        .insert(req.body)
        .write()


    res.status(201)
    res.locals.data = resource

}


function update(req, res, name, db, id) {
    let resource

    let chain = db.get(name)

    chain =
        req.method === 'PATCH'
            ? chain.updateById(id, req.body)
            : chain.replaceById(id, req.body)

    resource = chain.value()


    if (resource) {
        res.locals.data = resource
    }else{
        res.locals.data = { "msg": `${id} not found`, error: true }
    }
}

// DELETE /name/:id
function destroy(req, res, name, db, id) {
    let resource
    resource = db
        .get(name)
        .removeById(id)
        .value()


    if (resource) {
        res.locals.data = { "msg": `${id} removed Successfully`, error: false }
    }else{
        res.status(400);
        res.locals.data = { "msg": `${id} not found`, error: true }
    }
}