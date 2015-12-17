'use strict';

var _ = require('lodash');
var Q = require('q');

var grameneSwaggerClient = (function() {
  var Client = require('swagger-client');
  var deferred = Q.defer();
  var gramene = new Client({url: 'http://devdata.gramene.org/swagger', success: function() {
    deferred.resolve(gramene);
  }});
  return deferred.promise;
})();

module.exports = grameneSwaggerClient;