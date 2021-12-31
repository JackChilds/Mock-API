export default function fetchUser(req, res) {
    res.statusCode = 200;
    const { id } = req.query;
  
    res.send(`Fetch profile for user: ${id}`);
  }