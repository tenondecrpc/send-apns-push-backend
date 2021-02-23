require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');

const routes = require('./routes');

const app = express();

const server = http.Server(app);

app.use(cors());
app.use(express.json());
app.use(routes);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
