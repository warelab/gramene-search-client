var Q = require('q');
var resultFixtures = require('../support/searchResult48');
var jasminePit = require('jasmine-pit');
var _ = require('lodash');

var setExpectedResultAndGetSearchPromise = require('../support/testSwaggerClientPromiseFactory')('geneSearch', resultFixtures);

jasminePit.install(global);
require('jasmine-expect');


describe('geneSearch', function () {

  var searchInterface = require('../../src/searchInterface')
  var grameneSwaggerClient = require('../../src/grameneSwaggerClient');

  //var expectedResult;
  //
  //function setExpectedResultAndGetSearchPromise(name) {
  //  var fixture = resultFixtures[name];
  //  expectedResult = fixture.response.obj;
  //
  //  // comment out this line to test with real server
  //  spyOn(grameneSwaggerClient, 'then').andReturn(Q(_.cloneDeep(fixture.response)));
  //
  //  return searchInterface.geneSearch(fixture.query);
  //}

  function checkResultCounts(searchResult, expectedResult) {
    expect(searchResult).toBeDefined();
    expect(searchResult.metadata).toBeDefined();
    expect(searchResult.metadata.count).toEqual(expectedResult.response.numFound);
  }

  // not currently using / supporting this functionality.
  xit('should process tally correctly', function () {
    var searchPromise = setExpectedResultAndGetSearchPromise('tally');

    return searchPromise.then(function (searchResult) {
      checkResultCounts(searchResult, searchPromise.unprocessedResponse);

      expect(searchResult.tally).toBeDefined();
      expect(searchResult.tally.GO).toEqual(searchPromise.unprocessedResponse.facets.GO);
      expect(searchResult.tally.PO).toEqual(searchPromise.unprocessedResponse.facets.PO);
      expect(searchResult.tally.species).toEqual(searchPromise.unprocessedResponse.facets.species);
      expect(searchResult.tally.domains).toEqual(searchPromise.unprocessedResponse.facets.domains);
      expect(searchResult.tally.biotype).toEqual(searchPromise.unprocessedResponse.facets.biotype);

    });
  });

  pit('should process facet correctly', function () {
    var searchPromise = setExpectedResultAndGetSearchPromise('faceted');

    return searchPromise.then(function (searchResult) {
      checkResultCounts(searchResult, searchPromise.unprocessedResponse);

      // this is an object of results
      var taxonFacetResults = searchResult.taxon_id;
      expect(taxonFacetResults).toBeDefined();

      // this is an array of alternating keys and values as returned from SOLR
      var unprocessedTaxonIdsFromFixture = _.chunk(searchPromise.unprocessedResponse.facet_counts.facet_fields.taxon_id, 2);
      var countTaxonIdsWithAtLeastOneResult = _.filter(unprocessedTaxonIdsFromFixture, function(i) {
        return i[1] > 0;
      }).length;

      expect(_.size(taxonFacetResults.data)).toEqual(_.size(taxonFacetResults.sorted));
      expect(_.size(taxonFacetResults.data)).toEqual(_.size(unprocessedTaxonIdsFromFixture));
      expect(taxonFacetResults.count).toEqual(countTaxonIdsWithAtLeastOneResult);

      for(var i = 0; i < taxonFacetResults.sorted.length; i++) {
        var taxonFacet = taxonFacetResults.sorted[i];

        expect(taxonFacet.id).toEqual(+unprocessedTaxonIdsFromFixture[i][0]);
        expect(taxonFacet.count).toEqual(unprocessedTaxonIdsFromFixture[i][1]);
      }
    });
  });

  pit('should get result list', function () {
    var searchPromise = setExpectedResultAndGetSearchPromise('rows10');

    return searchPromise.then(function (searchResult) {
      checkResultCounts(searchResult, searchPromise.unprocessedResponse);

      expect(searchResult.list.length).toEqual(5);

      _.forEach(searchResult.list, function (doc, idx) {
        var expectedDoc = searchPromise.unprocessedResponse.response.docs[idx];
        expect(doc).toEqual(expectedDoc);
      })
    });
  });

  it('should allow test searches to be performed', function () {
    return searchInterface._testSearch('binned').then(function (data) {
      expect(data).toBeDefined();
    })
  });

});