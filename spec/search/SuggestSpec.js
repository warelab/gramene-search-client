'use strict';

var Q = require('q');
var suggestFixtures = require('../support/suggest48.json');
var jasminePit = require('jasmine-pit');
var _ = require('lodash');

var setExpectedResultAndGetSearchPromise = require('../support/testSwaggerClientPromiseFactory')('suggest', suggestFixtures);

jasminePit.install(global);
require('jasmine-expect');


describe('suggest', function () {

  var searchInterface = require('../../src/searchInterface');
  var grameneSwaggerClient = require('../../src/grameneSwaggerClient');

  //var expectedResult;
  //
  //function setExpectedResultAndGetSearchPromise(name) {
  //  var fixture = suggestFixtures[name];
  //  expectedResult = fixture.response.obj;
  //
  //  // comment out this line to test with real server
  //  //spyOn(grameneSwaggerClient, 'then').andReturn(Q(_.cloneDeep(fixture.response)));
  //
  //  return searchInterface.suggest(fixture.query);
  //}

  function checkResultCount(searchResult, expectedResult) {
    expect(searchResult).toBeDefined();
    expect(searchResult.metadata).toBeDefined();
    expect(searchResult.metadata.count).toEqual(expectedResult.grouped.category.matches);
  }

  pit('the simple case', function () {
    var term = 'lyr';
    var searchPromise = setExpectedResultAndGetSearchPromise(term);

    return searchPromise.then(function (searchResult) {
      checkResultCount(searchResult, searchPromise.unprocessedResponse);

      expect(searchResult.metadata.count).toEqual(7);
      expect(searchResult.metadata.query).toEqual(term);

      expect(searchResult.categories).toBeDefined();
      expect(searchResult.categories.length).toEqual(3);

      var topCat = searchResult.categories[0];
      expect(topCat.label).toEqual('InterPro');
      expect(topCat.num_found).toEqual(2);

      var topSug = topCat.suggestions[0];
      expect(topSug.category).toEqual('InterPro');
      expect(topSug.num_genes).toEqual(84);
    });
  });

  pit('if there are many suggestions', function () {
    var term = 'l';
    var searchPromise = setExpectedResultAndGetSearchPromise(term);

    return searchPromise.then(function (searchResult) {
      checkResultCount(searchResult, searchPromise.unprocessedResponse);

      expect(searchResult.metadata.count).toEqual(176982);
      expect(searchResult.metadata.query).toEqual(term);

      expect(searchResult.categories).toBeDefined();
      expect(searchResult.categories.length).toEqual(9);

      var topCat = searchResult.categories[0];
      expect(topCat.label).toEqual('Gene');
      expect(topCat.num_found).toEqual(169224);

      var topSug = topCat.suggestions[0];
      expect(topSug.category).toEqual('Gene');
      expect(topSug.num_genes).toEqual(1);
    });
  });

  pit('if there are no suggestions', function () {
    var term = 'xxy';
    var searchPromise = setExpectedResultAndGetSearchPromise(term);

    return searchPromise.then(function (searchResult) {
      checkResultCount(searchResult, searchPromise.unprocessedResponse);

      expect(searchResult.metadata.count).toEqual(0);
      expect(searchResult.metadata.query).toEqual(term);

      expect(searchResult.categories).toBeDefined();
      expect(searchResult.categories.length).toEqual(0);
    });
  });
});