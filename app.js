const config = require('./config');
const express = require('express');
const app = express();
const router = express.Router()
const basePath = config.basePath;
const fetch = require('node-fetch');

router.get('/code', async (req, res) => {
  const code = req.query.code;
  const session_id = req.query.session_id;
  console.log(code, session_id);
  const headers = {
    cookie: `django_language=en; op_session_id=${session_id}; ga-client-id=undefined`,
    'content-type': 'application/x-www-form-urlencoded',
  };
  const response = await fetch('https://www.pokemon.com/us/pokemon-trainer-club/verify_code/',{
    method: 'POST',
    body:`code=${code}`,
    headers: headers,
  })
  const body = await response.text();
  console.log(response);
  res.statusCode=response.status;
  res.set('Access-Control-Allow-Origin', '*');
  res.send(body);
});

router.use(express.static('public'))

// Add basePath as prefix to all routes in the router
app.use(basePath, router);

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});
