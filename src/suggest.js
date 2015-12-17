'use strict';

var _ = require('lodash');
var Q = require('q');

var grameneSwaggerClient = require('./grameneSwaggerClient');

function makeCall(gramene) {
  var deferred = Q.defer();
  var params = {q: queryString ? queryString + '*' : '*'};
  gramene['Search'].suggestions(params, deferred.resolve);
  return deferred.promise;
}

function reformatResponse(response) {
  // the following line is a safer equivalent of
  // `return response.obj.grouped.category.groups.map(function(category) {`
  return _.get(response, 'obj.grouped.category.groups').map(function (category) {
    var doclist = category.doclist;
    if (!category.doclist) {
      console.error('No doclist for category ', category);
      return;
    }

    return {
      label: category.groupValue,
      suggestions: doclist.docs,
      maxScore: doclist.maxScore,
      numFound: doclist.numFound
    }
  });
}

function promise(queryString) {
  return grameneSwaggerClient
    .then(function (query) {
      return makeCall(query)
    })
    .then(reformatResponse)
}


module.exports = {
  makeCall: makeCall,
  reformatResponse: reformatResponse,
  promise: promise
}