// example_processor.js
export function example(req, res, endpoint)
{
    res.status(200)
    res.send(`The endpoint is: ${endpoint}`)
}