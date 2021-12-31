export default function test(req, res) {
    res.statusCode = 200;
    res.json({ message: 'It works' });
}