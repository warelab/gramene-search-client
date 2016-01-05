'use strict';

var _ = require('lodash');
var Q = require('q');

var geneSearch = require('./geneSearch');
var suggest = require('./suggest');
//var genes = require('./genes');
var mongo = require('./mongo');

function testSearch(example) {
  return Q(_.cloneDeep(require('../spec/support/searchResult48')[example]))
    .then(geneSearch.reformatResponse);
}

exports.genes = mongo.genes;
exports.geneSearch = geneSearch.promise;
exports.suggest = suggest.promise;
exports._testSearch = testSearch;