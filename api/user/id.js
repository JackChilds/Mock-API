export default function id(req, res) {
    res.statusCode = 200;
    const { id } = req.query;
  
    res.send(`Fetch profile for user: ${id}`);
  }