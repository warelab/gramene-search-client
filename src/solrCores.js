'use strict';
var _ = require('lodash');

var rootURL = 'http://data.gramene.org/search/';
function isNumeric(fieldName) {
  return fieldName && (
    _.endsWith(fieldName, '_i') ||
    _.endsWith(fieldName, '_is') ||
    fieldName === 'id' ||
    fieldName === '_genes'
  );
}
var cores = {
  genes: {
    xref: {
      taxon_id: {core: 'taxonomy', displayName: 'Species'},
      interpro_xrefi: {core: 'interpro', displayName: 'Domain'},
      GO_xrefi: {core: 'GO', displayName: 'GO'},
      PO_xrefi: {core: 'PO', displayName: 'PO'}
    },
    isNumeric: function(fieldName) {
      return fieldName && (
        _.endsWith(fieldName, '_bin') ||
        _.endsWith(fieldName, '_xrefi') ||
        _.endsWith(fieldName, '_ancestors') ||
        fieldName === 'taxon_id' ||
        fieldName === 'start' ||
        fieldName === 'end' ||
        fieldName === 'strand'
      );
    }
  },
  taxonomy: {
    isNumeric: isNumeric
  },
  interpro: {
    isNumeric: isNumeric
  },
  GO: {
    isNumeric: isNumeric
  },
  PO: {
    isNumeric: isNumeric
  }
};

exports.getUrlForCore = function (core) {
  if (!cores[core]) throw new Error(core + ' is not a Gramene SOLR search core');
  return rootURL + core + '?';
};

exports.getXrefDisplayName = function (core, xrefName) {
  var xref;
  if (cores[core].hasOwnProperty('xref'))
    xref = cores[core].xref[xrefName];
  return xref ? xref.displayName : xrefName;
};

exports.valuesAreNumeric = function (core, fieldName) {
  return cores[core].isNumeric(fieldName);
};
