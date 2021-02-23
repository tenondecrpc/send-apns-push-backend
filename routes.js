const express = require('express');
const SendPushController = require('./push');

const routes = express.Router();

routes.post('/sendPush', SendPushController.sendPush);

module.exports = routes;
