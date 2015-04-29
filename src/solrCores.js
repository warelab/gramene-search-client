'use strict';
var _ = require('lodash');

var rootURL = 'http://data.gramene.org/search/';
var suggestURL = 'http://data.gramene.org/suggest/';
function isNumeric(fieldName) {
  return fieldName && (
    _.endsWith(fieldName, '_i') ||
    _.endsWith(fieldName, '_is') ||
    fieldName === 'id' ||
    fieldName === '_genes'
  );
}
function suggestParams(queryString) {
  return {
    q: '_terms:' + queryString.replace(/\s/g,'*'),
    fl: 'id,_genes,id_s,name_s',
    sort: '_genes desc',
    hl: true,
    'hl.fl':'_terms'
  };
}
function suggestFormatter(response,queryString,core) {
  // this function reformats the responses from the aux cores
  // there is another defined for genes
  var suggestions = [];
  var hl = response.data.highlighting;
  response.data.response.docs.forEach(function(doc){
    suggestions.push({
      term: hl[doc.id]._terms[0],
      weight: doc._genes,
      fq: cores[core].fqField+':'+doc.id,
      name: doc.name_s,
      id: doc.id_s
    });
  });
  return suggestions;
}
var cores = {
  genes: {
    displayName: 'Genes',
    fqField: 'text',
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
    },
    suggestUrl: suggestURL,
    suggestParams: function(queryString) {
      return {
        q:queryString
      }
    },
    suggestFormatter: function(response,queryString,core) {
      var suggestions = response.data.suggest.terms[queryString].suggestions;
      return suggestions.map(function(sug) {
        var cleanTerm = sug.term.replace(/<\/?b>/g,'');
        sug.term = sug.term.replace(/b>/g,'em>');
        sug.fq = cores[core].fqField+':'+cleanTerm;
        sug.label = cleanTerm;
        delete(sug.payload);
        return sug;
      });
      return suggestions;
    }
  },
  taxonomy: {
    displayName: 'Taxonomy',
    fqField:'NCBITaxon_ancestors',
    isNumeric: isNumeric,
    suggestUrl: rootURL,
    suggestParams: suggestParams,
    suggestFormatter: suggestFormatter
  },
  interpro: {
    displayName: 'Domains',
    fqField:'interpro_ancestors',
    isNumeric: isNumeric,
    suggestUrl: rootURL,
    suggestParams: suggestParams,
    suggestFormatter: suggestFormatter
  },
  GO: {
    displayName: 'Gene ontology',
    fqField:'GO_ancestors',
    isNumeric: isNumeric,
    suggestUrl: rootURL,
    suggestParams: suggestParams,
    suggestFormatter: suggestFormatter
  },
  PO: {
    displayName: 'Plant ontology',
    fqField:'PO_ancestors',
    isNumeric: isNumeric,
    suggestUrl: rootURL,
    suggestParams: suggestParams,
    suggestFormatter: suggestFormatter
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

exports.getCoreDisplayName = function (core) {
  return cores[core].displayName;
};

exports.valuesAreNumeric = function (core, fieldName) {
  return cores[core].isNumeric(fieldName);
};

exports.coreNames = function() {
  return Object.keys(cores);
};

exports.getSuggestUrl = function(core) {
  return cores[core].suggestUrl + core + '?';
}
exports.getSuggestParams = function(core, queryString) {
  return cores[core].suggestParams(queryString);
}

exports.handleSuggestResponse = function(core, response, queryString) {
  return cores[core].suggestFormatter(response,queryString,core);
}