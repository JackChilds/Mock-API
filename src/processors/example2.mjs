// example2.mjs
export default function handler(req, res, endpoint) {
    // Say hello if the name parameter begins with 'j', 
    // otherwise say access denied
    const nameParameter = req.query.name
    if (nameParameter.toLowerCase().startsWith('j')) {
        res.status(200)
        res.send(`Hello, ${nameParameter}!`)
    } else {
        res.status(403)
        res.send(`Denied access for endpoint: ${endpoint}.`)
    }
}