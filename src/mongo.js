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

  function makeCall(gramene, query) {
    var ids, params, apiMethodToInvoke;

    checkSchemaAgainst(gramene);

    ids = getIdListString(query);
    params = {
      idList: ids
    };
    apiMethodToInvoke = getCallFunction(gramene);

    return apiMethodToInvoke(params).then(function addApiToResponseAndResolvePromise(res) {
      res.client = gramene;
      return res;
    });
  }

  return function promise(queryString) {
    return grameneSwaggerClient
      .then(function makeCallFactory(client) {
        return makeCall(client, queryString);
      })
      .then(validate(schemaName))
      .then(reformatResponse);
  };
}

function getIdListString(query) {
  if (_.isString(query)) {
    return query;
  }

  if (_.isArray(query)) {
    return query.join(',');
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
