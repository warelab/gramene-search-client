'use strict';
var _ = require('lodash');

var rootURL = 'http://data.gramene.org/search/';
var cores = {
  genes: {
    xref: {
      taxon_id: {core: 'taxonomy', displayName: 'Species'},
      interpro_xrefi: {core: 'interpro', displayName: 'Domain'},
      GO_xrefi: {core: 'GO', displayName: 'GO'},
      PO_xrefi: {core: 'PO', displayName: 'PO'}
    },
  },
  taxonomy: {},
  interpro: {},
  GO: {},
  PO: {}
};

exports.getUrlForCore = function (core) {
  if (!cores[core]) throw new Error(core + ' is not a Gramene SOLR search core');
  return rootURL + core + '?';
};

exports.getXrefDisplayName = function (xrefName) {
  var xref = cores.genes.xref[xrefName];
  return xref ? xref.displayName : xrefName;
};

exports.valuesAreNumeric = function (fieldName) {
  return fieldName && (
    _.startsWith(fieldName, 'bin') ||
    _.endsWith(fieldName, 'i') ||
    _.endsWith(fieldName, '_bin') ||
    _.endsWith(fieldName, '_id') ||
    fieldName === 'start' ||
    fieldName === 'end' ||
    fieldName === 'strand'
    );
};
