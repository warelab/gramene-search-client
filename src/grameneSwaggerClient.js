'use strict';

var _ = require('lodash');
var Validator = require('swagger-model-validator');
var serverUrl = require('./serverUrl');

var grameneSwaggerClient = (function() {
  var Client = require('swagger-client');

  return new Client({url: serverUrl(), usePromise: true})
    .then(function addValidator(client) {
    new Validator(client);
    return client;
  });
})();

module.exports = grameneSwaggerClient;