var axios = require('axios');
var Q = require('q');
var resultFixtures = require('../support/searchResult48');
var jasminePit = require('jasmine-pit');
var _ = require('lodash');

jasminePit.install(global);
require('jasmine-expect');

describe('searchInterface', function () {

  var searchInterface, expectedResult;

  beforeEach(function () {
    searchInterface = require('../../src/searchInterface');
  });

  function setExpectedResultAndGetSearchPromise(name, params) {
    expectedResult = resultFixtures[name];
    spyOn(axios, 'get').andReturn(Q(_.cloneDeep(expectedResult)));
    return searchInterface.geneSearch(params);
  }

  function checkResultCounts(searchResult) {
    expect(searchResult).toBeDefined();
    expect(searchResult.metadata).toBeDefined();
    expect(searchResult.metadata.count).toEqual(expectedResult.data.response.numFound);
  }

  pit('should request default data', function () {
    // when
    var searchPromise = setExpectedResultAndGetSearchPromise('default');

    // then
    var args = axios.get.mostRecentCall.args;
    expect(args.length).toEqual(2);

    var params = args[1].params;
    // expect(args[0]).toEqual('http://data.gramene.org/search/genes?');
    expect(params.q).toEqual('*');
    expect(params.rows).toEqual(0);
    expect(params.facet).toEqual(true);

    return searchPromise.then(function(searchResult) {
      checkResultCounts(searchResult);
    });
  });

  pit('should process tally correctly', function() {
    var searchPromise = setExpectedResultAndGetSearchPromise('tally');
    
    return searchPromise.then(function(searchResult) {
      checkResultCounts(searchResult);

      expect(searchResult.tally).toBeDefined();
      expect(searchResult.tally.GO).toEqual(expectedResult.data.facets.GO);
      expect(searchResult.tally.PO).toEqual(expectedResult.data.facets.PO);
      expect(searchResult.tally.species).toEqual(expectedResult.data.facets.species);
      expect(searchResult.tally.domains).toEqual(expectedResult.data.facets.domains);
      expect(searchResult.tally.biotype).toEqual(expectedResult.data.facets.biotype);

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
      var unprocessedSystemNamesFromFixture = expectedResult.data.facet_counts.facet_fields.system_name;

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
        var expectedDoc = expectedResult.data.response.docs[idx];
        expect(doc).toEqual(expectedDoc);
      })
    });
  });

  pit('should not clobber the params passed in', function() {
    var params = {q: 'hello!'};
    var searchPromise = setExpectedResultAndGetSearchPromise('rows10', params);

    return searchPromise.then(function() {
      expect(axios.get.calls[0].args[1].params.q).toStartWith('hello!');
    });
  });

  it('should allow test searches to be performed', function() {
    return searchInterface._testSearch('binned').then(function(data) {
      expect(data).toBeDefined();
    })
  });
  
  pit('axios.all should behave as expected', function() {
    // given 
    spyOn(axios, 'get');
    var url = 'http://whatever';
    
    // when
    return axios.all([
      axios.get(url, {params: {foo:'bar'}}),
      axios.get(url, {params: {foo:'baz'}})
    ]).then(function(a, b) {
      
      // then
      expect(axios.get.calls.length).toEqual(2);
      
      var call0 = axios.get.calls[0];
      var call1 = axios.get.calls[1];
      
      expect(call0.args[0]).toEqual(url);
      expect(call0.args[1].params.foo).toEqual('bar');
      expect(call1.args[0]).toEqual(url);
      expect(call1.args[1].params.foo).toEqual('baz');
    });
  });
  
});