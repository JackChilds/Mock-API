# Processors
Processors can be used to extend the functionality of Mock API; place your processors in this directory in order for them to be used with Mock API.

Your processor function will take 3 arguments: the HTTP request and response objects as well as the endpoint that is being used. Read the [Vercel documentation](https://vercel.com/docs/runtimes#official-runtimes/node-js) for more info.

Your function will only be executed if the request data matches the configuration.

Code should be written in serverless Node.js and should export a default function that accepts 3 arguments as outlined in the paragraph above, see the example below for more information.

**E.g.**

```js
// example_processor.mjs
export default function handler(req, res, endpoint)
{
    res.status(200)
    res.send(`The endpoint is: ${endpoint}.`)
}
```

## Using processors in the dashboard
In the URL editor change the 'output response data as' field to 'custom processor', then in the field above input the path to the module relative to the `processors/` directory.