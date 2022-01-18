/*
*
* Mock API
* MIT License
* By Jack Childs 2022
*
*/

export function getResponseFromConfig(req, res) {
    function sortObj(obj) {
        return Object.keys(obj).sort().reduce(function (result, key) {
            result[key] = obj[key];
            return result;
        }, {});
    }

    const { readFileSync } = require ('fs')
    const { join } = require('path');

    const config = JSON.parse(readFileSync(join(__dirname, '../config.json'), 'utf8'));

    // construct a pathname URL from dynamic path query data
    let pathname = 'api'
    const sortedQueryData = sortObj(req.query);
    Object.keys(sortedQueryData).forEach((key) => {
        if (key.startsWith('mock-api-')) {
            pathname += '/' + sortedQueryData[key];
        }
    })

    let hasResponded = false
    Object.keys(config.api).forEach(ep => {
        if (ep != pathname.slice(4)) return
        config.api[ep].forEach(api => {
            if (api.method === req.method) {
                let valid = true;
                Object.keys(api.queryData).forEach(key => {
                    if (!valid) return
                    valid = api.queryData[key] == req.query[key] ? true : false;
                })

                if (valid) {
                    if (api.response.type != 'redirect')
                        res.status(api.response.status)
                    if (api.response.type === 'json')
                        res.json(JSON.parse(api.response.data))
                    else if (api.response.type === 'html')
                        res.send(api.response.data)
                    else if (api.response.type === 'redirect')
                        res.redirect(api.response.data)
                    else if (api.response.type === 'processor') {
                        import handler from api.response.data
                        handler(req, res, pathname.slice(4))
                    }
                        
                    
                    hasResponded = true
                }
            }
        })
    })

    if (!hasResponded) {
        res.status(404)
        res.json(config.notFound)
    }
}