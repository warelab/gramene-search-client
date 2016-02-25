'use strict';

var _ = require('lodash');
var Q = require('q');
var Validator = require('swagger-model-validator');

var grameneSwaggerClient = (function() {
  var Client = require('swagger-client');
  var deferred = Q.defer();
  var gramene = new Client({url: 'http://devdata.gramene.org/swagger', success: function() {
    deferred.resolve(gramene);
  }});
  return deferred.promise.then(function addValidator(client) {
    new Validator(client);
    return client;
  });
})();

module.exports = grameneSwaggerClient;