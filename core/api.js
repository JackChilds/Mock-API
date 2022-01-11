/*
*
* Mock API
* MIT License
* By Jack Childs 2022
*
*/

export function getResponseFromConfig(req, res) {
    fetch ('/config.json')
    .then(response => response.json())
    .then(data => {
        const config = JSON.parse(data);

        let hasResponded = false
        Object.keys(config.api).forEach(ep => {
            if (ep != window.location.pathname.slice(4)) return
            config.api[ep].forEach(api => {
                if (api.method === req.method) {
                    let valid = true;
                    Object.keys(api.queryData).forEach(key => {
                        if (!valid) return
                        valid = api.queryData[key] == req.query[key] ? true : false;
                    })

                    if (valid) {
                        res.status(api.response.status)
                        if (api.response.type === 'json')
                            res.json(api.response.data)
                        else if (api.response.type === 'html')
                            res.send(api.response.data)
                        
                        hasResponded = true
                    }
                }
            })
        })

        if (!hasResponded) {
            res.status(404)
            res.send('Error 404: Not Found')
        }

    })
}