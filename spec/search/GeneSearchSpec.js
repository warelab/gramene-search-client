var Q = require('q');
var resultFixtures = require('../support/searchResult48');
var jasminePit = require('jasmine-pit');
var _ = require('lodash');

jasminePit.install(global);
require('jasmine-expect');

var searchInterface = require('../../src/searchInterface')
var grameneSwaggerClient = require('../../src/grameneSwaggerClient');

describe('geneSearch', function () {

  var expectedResult;

  function setExpectedResultAndGetSearchPromise(name, params) {
    expectedResult = resultFixtures[name];
    spyOn(grameneSwaggerClient, 'then').andReturn(Q(_.cloneDeep(expectedResult)));
    return searchInterface.geneSearch(params);
  }

  function checkResultCounts(searchResult) {
    expect(searchResult).toBeDefined();
    expect(searchResult.metadata).toBeDefined();
    expect(searchResult.metadata.count).toEqual(expectedResult.obj.response.numFound);
  }

  pit('should process tally correctly', function() {
    var searchPromise = setExpectedResultAndGetSearchPromise('tally');
    
    return searchPromise.then(function(searchResult) {
      checkResultCounts(searchResult);

      expect(searchResult.tally).toBeDefined();
      expect(searchResult.tally.GO).toEqual(expectedResult.obj.facets.GO);
      expect(searchResult.tally.PO).toEqual(expectedResult.obj.facets.PO);
      expect(searchResult.tally.species).toEqual(expectedResult.obj.facets.species);
      expect(searchResult.tally.domains).toEqual(expectedResult.obj.facets.domains);
      expect(searchResult.tally.biotype).toEqual(expectedResult.obj.facets.biotype);

    });
  });

  pit('should process facet correctly', function() {
    var searchPromise = setExpectedResultAndGetSearchPromise('faceted');

    return searchPromise.then(function(searchResult) {
      checkResultCounts(searchResult);

      // this is an array of keys
      var speciesFacetResults = searchResult.system_name.data;
      expect(speciesFacetResults).toBeDefined();

      // this is an array of alternating keys and values as returned from SOLR
      var unprocessedSystemNamesFromFixture = expectedResult.obj.facet_counts.facet_fields.system_name;

      expect(searchResult.system_name.count).toEqual(unprocessedSystemNamesFromFixture.length / 2);

      _.forEach(Object.keys(speciesFacetResults), function(speciesName, idx) {
        var count = speciesFacetResults[speciesName].count;
        expect(speciesName).toEqual(unprocessedSystemNamesFromFixture[idx*2]);
        expect(count).toEqual(unprocessedSystemNamesFromFixture[idx*2 + 1]);
      });
    });
  });

  pit('should get result list', function() {
    var searchPromise = setExpectedResultAndGetSearchPromise('rows10');

    return searchPromise.then(function(searchResult) {
      checkResultCounts(searchResult);

      expect(searchResult.list.length).toEqual(10);

      _.forEach(searchResult.list, function(doc, idx) {
        var expectedDoc = expectedResult.obj.response.docs[idx];
        expect(doc).toEqual(expectedDoc);
      })
    });
  });

  it('should allow test searches to be performed', function() {
    return searchInterface._testSearch('binned').then(function(data) {
      expect(data).toBeDefined();
    })
  });
  
});