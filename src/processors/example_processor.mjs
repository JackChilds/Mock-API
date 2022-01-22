// example_processor.mjs
export default function handler(req, res, endpoint)
{
    res.status(200)
    res.send(`The endpoint is: ${endpoint}.`)
    res.send('Read the docs for more information on how to create your own custom processor.')
}