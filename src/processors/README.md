# Processors
Place custom 'processors' in here to be used with Mock API.

Use processors to extend the functionality of Mock API, you are also able to distribute your extension to users with extension integration links.

Your processor function will take 3 arguments: the HTTP request and response objects as well as the endpoint that is being used. Read the [Vercel documentation](https://vercel.com/docs/runtimes#official-runtimes/node-js) for more info.

Your function will only be executed if the request data matches the configuration.

Code should be written in serverless Node.js and should export a default function that accepts 3 arguments as outlined in the paragraph above, see the example below for more information.

**E.g.**

```js
// example_processor.js
export default function example(req, res, endpoint)
{
    res.status(200)
    res.send(`The endpoint is: ${endpoint}`)
}
```