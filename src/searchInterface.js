'use strict';

var _ = require('lodash');
var Q = require('q');

var geneSearch = require('./geneSearch');
var suggest = require('./suggest');
var mongo = require('./mongo');

function testSearch(example) {
  return Q(_.cloneDeep(require('../spec/support/searchResult48')[example]))
    .then(geneSearch.reformatResponse);
}

exports.grameneClient = require('./grameneSwaggerClient');

exports.geneSearch = geneSearch.promise;
exports.suggest = suggest.promise;

exports.genes = mongo.genes;
exports.genetrees = mongo.genetrees;
exports.domains = mongo.domains;
exports.pathways = mongo.pathways;
exports.GO = mongo.GO;
exports.PO = mongo.PO;

exports._testSearch = testSearch;