'use strict';

var _ = require('lodash');
var Q = require('q');

var geneSearch = require('./geneSearch');
var suggest = require('./suggest');
var mongo = require('./mongo');

function testSearch(example) {
  var tests = require('../spec/support/searchResult48');
  var testResults = _.get(tests, [example, 'response']);
  if(!testResults) {
    throw new Error("testSearch should be one of " + _.keys(tests).join(', '));
  }
  return Q(_.cloneDeep(testResults))
    .then(geneSearch.reformatResponse);
}

exports.grameneClient = require('./grameneSwaggerClient');
exports.validate = require('./validate');

exports.geneSearch = geneSearch.promise;
exports.suggest = suggest.promise;

exports.genes = mongo.genes;
exports.genetrees = mongo.genetrees;
exports.domains = mongo.domains;
exports.pathways = mongo.pathways;
exports.GO = mongo.GO;
exports.PO = mongo.PO;

exports._testSearch = testSearch;