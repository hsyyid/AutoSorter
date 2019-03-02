exports.helloHttp = (req, res) => {
  res.send(`Hello ${(req.query.query)}`);
  console.log(JSON.stringify(req));
}
