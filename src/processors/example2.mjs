export default function handler(req, res, endpoint) {
    const nameParameter = req.queryData.name
    if (nameParameter.toLowerCase().startsWith('j')) {
        res.status(200)
        res.send(`Hello, ${nameParameter}!`)
    } else {
        res.status(403)
        res.send(`Denied access for endpoint: ${endpoint}.`)
    }
}