// example_processor.mjs
export default function handler(req, res, endpoint)
{
    res.status(200)
    res.send(`The endpoint is: ${endpoint}.`)
}