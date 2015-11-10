'use strict';

var cores = require('./solrCores');
var suggesters = require('./suggesters');
var axios = require('axios');
var _ = require('lodash');
var Q = require('q');

function geneSearch(query) {
  var coreName = 'genes';
  var url = cores.getUrlForCore(coreName);
  var params = getSolrParameters(query);

  return axios.get(url, {params: params})
    .then(reformatData(coreName));
}

function suggest(queryString) {
  var sugRequests = suggesters.suggesterNames().map(function(sugName) {
    var url = suggesters.getSuggestUrl(sugName);
    var params = suggesters.getSuggestParams(sugName,queryString);
    return axios.get(url, {params: params});
  });
  
  return axios.all(sugRequests)
    .then(function(sugResponses) {
      var data = [];
      var sugNames = suggesters.suggesterNames();
      for(var i=0; i<sugNames.length; i++) {
        data.push({
          label: suggesters.getDisplayName(sugNames[i]),
          suggestions: suggesters.handleSuggestResponse(sugNames[i], sugResponses[i], queryString)
        });
      }
      return data;
    });
}

function coreLookup(coreName,ids,userParams) {
  var url = 'http://data.gramene.org/' + coreName + '/select';
  var idList;
  if (Array.isArray(ids)) {
    idList = _.uniq(ids);
  } else {
    idList = [ids];
  }
  var queryField = '_id';

  var p = _.cloneDeep(userParams);
  if (!p) p={};
  if (p.field) {
    queryField = p.field;
    delete p.field;
  }

  if (p.fl && !_.includes(p.fl,queryField)) {
     p.fl.push(queryField);
     p.fl = p.fl.join(',');
  }
  // idList may be too long, so we split into batches
  var batchSize=100;
  var promises = [];
  var offset=0;
  var lut={};
  while (offset < idList.length) {
    var params = {
      rows:-1 // because batchSize might be < number of matched docs
    };
    params[queryField] = idList.slice(offset,offset+batchSize);
    for(var f in p) {
      params[f] = p[f];
    }
    offset += batchSize;
    promises.push(axios.get(url, {params: params})
    .then(function(response) {
      response.data.response.forEach(function(doc) {
        var k = doc[queryField];
        delete doc[queryField];
        if (lut[k]) {
          lut[k].push(doc);
        }
        else {
          lut[k] = [doc];
        }
      });
    }));
  }
  return axios.all(promises).then(function() {
    return lut;
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
    var data = response.data;
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
exports.coreLookup = coreLookup;