'use strict';

var _ = require('lodash');
var Q = require('q');

var grameneSwaggerClient = require('./grameneSwaggerClient');
var geneSearchLib = require('./geneSearch');
var suggestLib = require('./suggest');

function geneSearch(query) {
  return grameneSwaggerClient
    .then(geneSearchLib.makeCall)
    .then(geneSearchLib.reformatResponse);
}

function suggest(queryString) {
  return grameneSwaggerClient
    .then(suggestLib.makeCall)
    .then(suggestLib.reformatResponse);
}

function testSearch(example) {
  return Q(_.cloneDeep(require('../spec/support/searchResult48')[example]))
    .then(geneSearch.reformatResponse);
}

exports.geneSearch = geneSearch;
exports._testSearch = testSearch;
exports._grameneClientPromise = grameneSwaggerClient;
exports.suggest = suggest;
//exports.coreLookup = coreLookup;