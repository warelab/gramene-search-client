'use strict';
var _ = require('lodash');
var helpers = require('./suggestHelpers');

var rootURL = 'http://data.gramene.org/search/';
var suggestURL = 'http://data.gramene.org/suggest/';

var suggesters = {
  text: {
    displayName: 'Text search',
    suggestUrl: suggestURL + 'genes',
    suggestParams: helpers.params.text,
    suggestFormatter: helpers.formatters.text
  },
  genes: {
    displayName: 'Genes',
    suggestUrl: rootURL + 'genes',
    suggestParams: helpers.params.genes,
    suggestFormatter: helpers.formatters.genes
  },
  taxonomy: {
    displayName: 'Taxonomy',
    suggestUrl: rootURL+'taxonomy',
    suggestParams: helpers.params.default,
    suggestFormatter: helpers.formatters.forFqField('NCBITaxon_ancestors')
  },
  interpro: {
    displayName: 'Domains',
    suggestUrl: rootURL+'interpro',
    suggestParams: helpers.params.default,
    suggestFormatter: helpers.formatters.forFqField('interpro_ancestors')
  },
  "GO_c": {
    displayName: 'GO component',
    suggestUrl: rootURL+'GO',
    suggestParams: helpers.params.goFactory("cellular_component"),
    suggestFormatter: helpers.formatters.forFqField('GO_ancestors')
  },
  "GO_f": {
    displayName: 'GO function',
    suggestUrl: rootURL+'GO',
    suggestParams: helpers.params.goFactory("molecular_function"),
    suggestFormatter: helpers.formatters.forFqField('GO_ancestors')
  },
  "GO_p": {
    displayName: 'GO process',
    suggestUrl: rootURL+'GO',
    suggestParams: helpers.params.goFactory("biological_process"),
    suggestFormatter: helpers.formatters.forFqField('GO_ancestors')
  },
  PO: {
    displayName: 'Plant ontology',
    suggestUrl: rootURL+'PO',
    suggestParams: helpers.params.default,
    suggestFormatter: helpers.formatters.forFqField('PO_ancestors')
  }
};

exports.suggesterNames = function() {
  return Object.keys(suggesters);
};

exports.getDisplayName = function (type) {
  return suggesters[type].displayName;
};

exports.getSuggestUrl = function(type) {
  if (!suggesters[type]) throw new Error(type + ' is not a Gramene suggester');
  return suggesters[type].suggestUrl + '?';
};

exports.getSuggestParams = function(type, queryString) {
  return suggesters[type].suggestParams(queryString);
};

exports.handleSuggestResponse = function(type, response, queryString) {
  return suggesters[type].suggestFormatter(response, queryString, type);
};
