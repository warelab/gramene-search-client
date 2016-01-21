var resultFixtures = require('../support/searchResult48');
var jasminePit = require('jasmine-pit');
var _ = require('lodash');

var setExpectedResultAndGetSearchPromise = require('../support/testSwaggerClientPromiseFactory')('geneSearch', resultFixtures);

jasminePit.install(global);
require('jasmine-expect');


describe('geneSearch', function () {

  var searchInterface = require('../../src/searchInterface');
  var grameneSwaggerClient = require('../../src/grameneSwaggerClient');

  function checkResultCounts(searchResult, expectedResult) {
    expect(searchResult).toBeDefined();
    expect(searchResult.metadata).toBeDefined();
    expect(searchResult.metadata.count).toEqual(expectedResult.response.numFound);
    expect(searchResult.metadata.validation.valid).toEqual(true);
  }

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
    });
  });

  pit('should allow test searches to be performed', function () {
    return searchInterface._testSearch('rows10').then(function (data) {
      expect(data).toBeDefined();
    })
  });

  it('should give descriptive error if invalid test results are requested from a testSearch', function () {
    function shouldThrow() { searchInterface._testSearch('rows100') }
    expect(shouldThrow).toThrow();
  });

});