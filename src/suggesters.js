'use strict';
var _ = require('lodash');

var rootURL = 'http://data.gramene.org/search/';
var suggestURL = 'http://data.gramene.org/suggest/';

function suggestParams(queryString) {
  queryString += '*';
  if (queryString.match(/\s/)) {
    queryString = '\''+queryString+'\'';
  }
  return {
    q: queryString,
    fl: '_terms,id,_genes,id_s,name_s',
    sort: '_genes desc'
  };
}

function goParams(goNamespace) {
  return function(queryString) {
    var result = suggestParams(queryString);
    result.fq = "namespace_s:" + goNamespace;
    return result
  }
}

function suggestFormatter(response,queryString,type) {
  // this function reformats the responses from the aux cores
  // there is another defined for genes
  var reList = queryString.split(/\s/);
  for(var i=0;i<reList.length;i++) {
    var term = reList[i];
    if (i+1==reList.length) {
      reList[i] = new RegExp('\\b(' + term + ')', 'gi');
    }
    else {
      reList[i] = new RegExp('\\b(' + term + ')\\b', 'gi');
    }
  }
  var suggestions = [];
  response.data.response.docs.forEach(function(doc){
    var hl = doc._terms;
    reList.forEach(function(re) {
      hl= hl.replace(re,'<em>$1</em>');
    });
    hl = hl.replace(/\S+\s\|\s/,'');
    suggestions.push({
      term: hl,
      weight: doc._genes,
      fq: suggesters[type].fqField+':'+doc.id,
      name: doc.name_s,
      id: doc.id_s
    });
  });
  return suggestions;
}
var suggesters = {
  text: {
    displayName: 'Text search',
    suggestUrl: suggestURL + 'genes',
    suggestParams: function(queryString) {
      return {
        q:queryString
      }
    },
    suggestFormatter: function(response,queryString,type) {
      var suggestions = response.data.suggest.terms[queryString].suggestions;
      return suggestions.map(function(sug) {
        var cleanTerm = sug.term.replace(/<\/?b>/g,'');
        sug.term = sug.term.replace(/b>/g,'em>');
        sug.fq = 'text:'+cleanTerm;
        sug.label = cleanTerm;
        delete(sug.payload);
        return sug;
      });
      return suggestions;
    }
  },
  genes: {
    displayName: 'Genes',
    suggestUrl: rootURL + 'genes',
    suggestParams: function (queryString) {
      queryString += '*';
      if (queryString.match(/\s/)) {
        queryString = '\''+queryString+'\'';
      }
      return {
        q: 'ids:'+queryString,
        fl: 'id,ids_exact,name',
        rows: 200
      };
    },
    suggestFormatter: function(response,queryString,type) {
      var queryRegexp = new RegExp('\\b' + queryString, 'i');
      var suggestions = _(response.data.response.docs)
        .forEach(function(doc){
          doc.queriedId = _.find(doc.ids_exact, function(id) {
            return !!id.match(queryRegexp);
          });
        })
        .groupBy('queriedId')
        .map(function(listOfDocs, queriedId) {
          var doc, numDocs;
          doc = _.first(listOfDocs);
          numDocs = listOfDocs.length;
          return {
            term: queriedId,
            weight: numDocs,
            fq: 'ids:'+queriedId,
            name: doc.name,
            id: doc.id
          };
        })
        .sort('weight')
        .slice(0, 10);
      
        return suggestions.value();
    }

  },
  taxonomy: {
    displayName: 'Taxonomy',
    fqField: 'NCBITaxon_ancestors',
    suggestUrl: rootURL+'taxonomy',
    suggestParams: suggestParams,
    suggestFormatter: suggestFormatter
  },
  interpro: {
    displayName: 'Domains',
    fqField:'interpro_ancestors',
    suggestUrl: rootURL+'interpro',
    suggestParams: suggestParams,
    suggestFormatter: suggestFormatter
  },
  //GO: {
  //  displayName: 'Gene ontology',
  //  fqField:'GO_ancestors',
  //  suggestUrl: rootURL+'GO',
  //  suggestParams: suggestParams,
  //  suggestFormatter: suggestFormatter
  //},
  "GO_c": {
    displayName: 'GO component',
    fqField:'GO_ancestors',
    suggestUrl: rootURL+'GO',
    suggestParams: goParams("cellular_component"),
    suggestFormatter: suggestFormatter
  },
  "GO_f": {
    displayName: 'GO function',
    fqField:'GO_ancestors',
    suggestUrl: rootURL+'GO',
    suggestParams: goParams("molecular_function"),
    suggestFormatter: suggestFormatter
  },
  "GO_p": {
    displayName: 'GO process',
    fqField:'GO_ancestors',
    suggestUrl: rootURL+'GO',
    suggestParams: goParams("biological_process"),
    suggestFormatter: suggestFormatter
  },
  PO: {
    displayName: 'Plant ontology',
    fqField:'PO_ancestors',
    suggestUrl: rootURL+'PO',
    suggestParams: suggestParams,
    suggestFormatter: suggestFormatter
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
}

exports.getSuggestParams = function(type, queryString) {
  return suggesters[type].suggestParams(queryString);
}

exports.handleSuggestResponse = function(type, response, queryString) {
  return suggesters[type].suggestFormatter(response,queryString,type);
}