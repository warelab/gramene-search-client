'use strict';

var _ = require('lodash');
var Q = require('q');

var validate = require('./validate');
var grameneSwaggerClient = require('./grameneSwaggerClient');
var mongoCollections = require('gramene-mongodb-config');

grameneSwaggerClient.then(function(client) {
  console.log(client['Data access']);
});

//_.forEach(['genetrees', ], function(name) {
//  module.exports[name] = getFactory(coll.mongoCollection());
//});

// TODO Modify this implementation to support genetrees, etc.

function makeCall(gramene, query) {
  var deferred = Q.defer();
  var ids = getIdListString(query);
  var params = {
    idList: ids
  };

  gramene['Data access'].genes(params, function(res) {
    res.client = gramene;
    deferred.resolve(res);
  });

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
    .then(validate("MongoGeneResponse"))
    .then(reformatResponse);
}


module.exports = {
  makeCall: makeCall,
  reformatResponse: reformatResponse,
  promise: promise
};