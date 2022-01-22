// example_processor.js
function example(req, res, endpoint)
{
    res.status(200)
    res.send(`The endpoint is: ${endpoint}`)
}

export default example