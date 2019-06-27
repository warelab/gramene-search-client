'use strict';

var _ = require('lodash');

var validate = require('./validate');
var grameneSwaggerClient = require('./grameneSwaggerClient');

// hard code these here so that we can guarantee module.export functions are
// available immediately.
var collections = {
  genes: "MongoGenesResponse",
  genetrees: "MongoGenetreesResponse",
  maps: "MongoMapsResponse",
  domains: "InterProResponse",
  taxonomy: "TaxonomyResponse",
  GO: "OntologyResponse",
  PO: "OntologyResponse",
  pathways: "ReactomeEntityResponse"
};

var batchSize=100;

module.exports = _.mapValues(collections, callPromiseFactory);

function callPromiseFactory(schemaName, methodName) {
  function getCallFunction(gramene) {
    return gramene['Data access'][methodName];
  }

  function getSchemaName(gramene) {
    var $ref = _.get(gramene, ['Data access', 'apis', methodName, 'type','schema', '$ref']);
    if ($ref && $ref.indexOf('#/definitions/') == 0) {
      return $ref.substring(14);
    }
  }

  function checkSchemaAgainst(gramene) {
    var scheamNameFromAPI = getSchemaName(gramene);
    if(scheamNameFromAPI !== schemaName) {
      throw new Error("Schema name mismatch. Expected " + schemaName + ", got " + scheamNameFromAPI);
    }
  }

  function makeCall(gramene, query, extraParams) {

    checkSchemaAgainst(gramene);

    var batches = getIdListString(query);
    var promises = batches.map(function(ids) {
      var params = {
        idList: ids
      };
      _.assign(params, extraParams);

      var apiMethodToInvoke = getCallFunction(gramene);
      return apiMethodToInvoke(params);
    });

    return Promise.all(promises).then(function concatenateBatchesAddApiToResponseAndResolvePromises(resList) {
      var docs = [];
      resList.forEach(function(response) {
        docs = docs.concat(response.obj)
      });
      var res = resList[0];
      res.client = gramene;
      res.obj = docs;
      return res;
    });
  }

  return function promise(queryString, extraParams) {
    return grameneSwaggerClient
      .then(function makeCallFactory(client) {
        return makeCall(client, queryString, extraParams);
      })
      .then(validate(schemaName))
      .then(reformatResponse);
  };
}

function getIdListString(query) {
  if (_.isString(query)) {
    return [query];
  }

  if (_.isArray(query)) {
    var batches = [];
    for(var i=0;i<query.length;i+=batchSize) {
      var batch = query.slice(i,i+batchSize);
      if (batch.length === 1) {
        batch.push(0);
      }
      batches.push(batch.join(','));
    }
    return batches;
  }

  throw new Error('Query should be a string or an array. We were provided ' + typeof query);
}

function reformatResponse(response) {
  var results = response.obj;
  return {
    metadata: {
      url: response.url,
      count: results.length,
      validation: response.validation
    },
    docs: results
  };
}
