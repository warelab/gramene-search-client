'use strict';

var cores = require('./solrCores');
var _ = require('lodash');

var grameneClientPromise = (function() {
  var Q = require('q');
  var Client = require('swagger-client-promises');
  var deferred = Q.defer();
  var gramene = new Client({url: 'http://brie.cshl.edu:10010/swagger', success: function() {
    deferred.resolve(gramene);
  }});
  return deferred.promise;
})();

function geneSearch(query) {
  return grameneClientPromise
    .then(function(gramene) {
      console.log('will ask for gene search docs');
      var params = getSolrParameters(query);
      params.collection = 'genes';
      return gramene['Search'].genes(params);
    })
    .then(reformatData('genes'));
}

function suggest(queryString) {
  return grameneClientPromise
    .then(function(gramene) {
      var params = {q: queryString ? queryString + '*' : '*'};
      console.log('will ask for suggestions for ' + params.q);
      return gramene['Search'].suggestions(params);
    })
    .then(function(response) {
      // the following line is a safer equivalent of
      // `return response.obj.grouped.category.groups.map(function(category) {`
      return _.get(response, 'obj.grouped.category.groups').map(function(category) {
        var doclist = category.doclist;
        if(!category.doclist) {
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
    });
}

function testSearch(example) {
  return Q(_.cloneDeep(require('../spec/support/searchResult48')[example]))
    .then(reformatData('genes'));
}

function defaultSolrParameters() {
  return {
    q: '*',
    rows: 0,
    facet: true
  };
}

function getSolrParameters(query) {
  var result = defaultSolrParameters();
  if(!query) return result;

  result.q = (query.q || '') + '*';

  for(var rtName in query.resultTypes) {
    _.assign(result, query.resultTypes[rtName], function(existing, another) {
      var result = existing;

      // handle the case where the same key may be defined in many result types, for example
      // facet.field. It's typical for solr to have multiple facet.field parameters in the URL,
      // e.g. http://data.gramene.org/search/genes?wt=json&indent=true&q=*&rows=2&start=0&facet=true&facet.field=bin_10Mb&facet.field=bin_5Mb&facet.limit=10&facet.mincount=1&f.bin_10Mb.facet.limit=10&fq=Interpro_xrefs:(IPR008978 IPR002068)
      if(existing) {
        if(_.isArray(existing)) {
          existing.push(another);
          result = existing;
        }
        else {
          result = [existing, another];
        }
      }
      else {
        result = another;
      }

      return result;
    });
  }

  if(query.filters && Object.keys(query.filters).length) {
    result.fq = Object.keys(query.filters);
  }

  return result;
}

function reformatData(core) {
  return function(response) {
    console.log('reformatting data');
    var data = response.obj;
    var fixed = {};
    
    if (data.facet_counts) {
      var originalFacets = data.facet_counts.facet_fields;
      if(originalFacets && !data.results) {
        fixed = data.results = {};
        for(var f in originalFacets) {
          fixed[f] = reformatFacet(originalFacets[f], cores.valuesAreNumeric(core,f), cores.getXrefDisplayName(core,f));
        }
        delete data.facet_counts;
      }
    }
        
    if(data.response.docs.length) {
      fixed.list = data.response.docs;
    }
    fixed.metadata = {
      count: data.response.numFound,
      qtime: data.responseHeader.QTime
    };

    if (data.facets) {
      fixed.tally={};
      for(var f in data.facets) {
        fixed.tally[f] = data.facets[f];
      }
    }

    return fixed;
  }
}

function reformatFacet(facetData, numericIds, displayName) {
  // facet data is an array of alternating ids (string) and counts (int),
  // e.g. ["4565", 99155, "3847", 54159, "109376", 46500, ... ]

  // we will make an associative array with id key and an object
  // for count and other values that may be added later.
  // e.g. { data : { "4565" : { count : 99155 }, // order here not guaranteed :-(
  //                 "3847" : { count: 54159 },
  //                 "109376" : { count: 46500 }
  //               }
  //      }
  var result = {data: {}, sorted: [], count: 0, displayName: displayName};
  for (var i=0;i<facetData.length;i+=2) {
    var id = numericIds ? parseInt(facetData[i]) : facetData[i]
      , count = facetData[i+1]
      , datum = { id: id, count: count };

    result.data[id] = datum;
    result.sorted.push(datum);
    if(count > 0) result.count++;
  }
  return result;
}

exports.geneSearch = geneSearch;
exports._testSearch = testSearch;
exports.suggest = suggest;
//exports.coreLookup = coreLookup;