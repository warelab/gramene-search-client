'use strict';

var _ = require('lodash');
var Q = require('q');

var grameneSwaggerClient = require('./grameneSwaggerClient');
var validate = require('./validate');

function makeCall(gramene, queryString) {
  var deferred = Q.defer();
  var params = {q: queryString ? queryString + '*' : '*'};

  gramene['Search'].suggestions(params, function(res) {
    res.client = gramene;
    deferred.resolve(res);
  });

  return deferred.promise;
}

function reformatResponse(response) {
  var query, category, categories;
  query = _.get(response, 'obj.responseHeader.params.q');

  // remove the trailing '*'
  if(query && query.length) {
    query = query.slice(0, -1);
  }

  category = _.get(response, 'obj.grouped.category');
  categories = _.get(response, 'obj.grouped.category.groups');

  if(categories) {
    // the following line is a safer equivalent of
    // `return response.obj.grouped.category.groups.map(function(category) {`
    categories = categories.map(function reformatSuggestionCategory(category) {
      var doclist = category.doclist;
      if (!category.doclist) {
        console.error('No doclist for category ', category);
        return;
      }

      return {
        label: category.groupValue,
        suggestions: doclist.docs,
        max_score: doclist.maxScore,
        num_found: doclist.numFound
      }
    });
  }

  return {
    metadata: {
      query: query,
      count: category.matches,
      url: response.url
    },
    categories: categories
  }
}

function promise(queryString) {
  return grameneSwaggerClient
    .then(function (client) {
      return makeCall(client, queryString);
    })
    .then(validate("SolrSuggestResponse"))
    .then(reformatResponse);
}


module.exports = {
  makeCall: makeCall,
  reformatResponse: reformatResponse,
  promise: promise
};