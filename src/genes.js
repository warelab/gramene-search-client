'use strict';

var _ = require('lodash');
var Q = require('q');

var grameneSwaggerClient = require('./grameneSwaggerClient');

function makeCall(grameneSwaggerClient, query) {
  var deferred = Q.defer();
  var ids = getIdListString(query);
  var params = {
    collection: 'genes',
    idList: ids
  }
  grameneSwaggerClient['Data access'].get(params, deferred.resolve);
  return deferred.promise;
}

function getIdListString(query) {
  if(_.isString(query)) {
    return query;
  }

  if(_.isArray(query)) {
    return query.join(',');
  }

  throw new Error('Query should be a string or an array. We were provided ' + typeof query);
}

function reformatResponse(response) {
  var results = response.obj;
  return {
    metadata: {
      url: response.url,
      count: response.obj.length
    },
    docs: response.obj
  }
}

function promise(queryString) {
  return grameneSwaggerClient
    .then(function (client) {
      return makeCall(client, queryString);
    })
    .then(reformatResponse);
}


module.exports = {
  makeCall: makeCall,
  reformatResponse: reformatResponse,
  promise: promise
}