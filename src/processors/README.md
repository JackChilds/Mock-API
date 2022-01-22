# Processors
Processors can be used to extend the functionality of Mock API; place your processors in this directory in order for them to be used with Mock API.

Your processor function will take 3 arguments: the HTTP request and response objects as well as the endpoint that is being used. Read the [Vercel documentation](https://vercel.com/docs/runtimes#official-runtimes/node-js) for more info.

Your function will only be executed if the request data matches the configuration.

Code should be written in serverless Node.js and should export a default function that accepts 3 arguments as outlined in the paragraph above, see the examples below for more information.

### Example 1

```js
// example_processor.mjs
export default function handler(req, res, endpoint)
{
    res.status(200)
    res.send(`The endpoint is: ${endpoint}.`)
}
```

### Example 2
**Note**: if you require dynamic query data (where you don't know what the contents of a parameter will be until runtime), don't set query data in the dashboard.
```js
// example2.mjs
export default function handler(req, res, endpoint) {
    // Say hello if the name parameter begins with 'j', 
    // otherwise say access denied
    const nameParameter = req.query.name

    if (nameParameter === undefined) {
        res.status(400).json({
            message: 'Missing name parameter'
        })
        return
    }

    if (nameParameter.toLowerCase().startsWith('j')) {
        res.status(200)
        res.send(`Hello, ${nameParameter}!`)
    } else {
        res.status(403)
        res.send(`Denied access for endpoint: ${endpoint}.`)
    }
}
```

## Using processors in the dashboard
In the URL editor change the 'output response data as' field to 'custom processor', then in the field above input the path to the module relative to the `processors/` directory.
