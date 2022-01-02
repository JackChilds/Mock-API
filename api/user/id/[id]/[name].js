export default function fetchUser(req, res) {
    console.log(`Request method: ${req.method}\nRequest url: ${req.url}`);
  
    res.statusCode = 200;
    const { id, name } = req.query;
  
    console.log(`Request query: ${JSON.stringify(req.query)}`);
  
    res.send(`Fetch profile for user: ${id}. Name: ${name}.`);
  }