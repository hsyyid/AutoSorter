const escapeHtml = require('escape-html')

exports.helloHttp = (req, res) => {
  res.send(`Hello ${escapeHtml(req.query)}`);
}
