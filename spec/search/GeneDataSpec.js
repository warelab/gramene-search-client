"use strict";

var Q = require('q');
var geneFixtures = require('../support/genes48');
var jasminePit = require('jasmine-pit');
var _ = require('lodash');

jasminePit.install(global);
require('jasmine-expect');

var setExpectedResultAndGetSearchPromise = require('../support/testSwaggerClientPromiseFactory')('genes', geneFixtures);

describe('geneData', function () {
  var searchInterface = require('../../src/searchInterface');
  var grameneSwaggerClient = require('../../src/grameneSwaggerClient');

  it('should have a method "searchInterface.genes" that returns a promise', function() {
    expect(searchInterface.genes).toBeDefined();
    expect(_.isFunction(searchInterface.genes)).toEqual(true);

    expect(_.isFunction(searchInterface.genes('AT3G52430').then)).toEqual(true);
  });

  pit('should fail when provided `undefined` as query', function() {
    return searchInterface.genes().catch(function(err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual('Query should be a string or an array. We were provided undefined');
    });
  });

  pit('should fail when provided object as query', function() {
    return searchInterface.genes({id:'AT3G52430'}).catch(function(err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual('Query should be a string or an array. We were provided object');
    });
  });

  pit('should retreive a single document when provided a single ID', function() {
    return setExpectedResultAndGetSearchPromise('single').then(function(searchResult) {
      expect(searchResult.metadata.count).toEqual(1);
      expect(searchResult.metadata.url).toBeDefined();
      expect(searchResult.docs).toBeDefined();
      expect(searchResult.docs.length).toEqual(1);
    });
  });


  pit('should retreive a single document when provided a single ID in an array', function() {
    return setExpectedResultAndGetSearchPromise('array1').then(function(searchResult) {
      expect(searchResult.metadata.count).toEqual(1);
      expect(searchResult.metadata.url).toBeDefined();
      expect(searchResult.docs).toBeDefined();
      expect(searchResult.docs.length).toEqual(1);
    });
  });

  pit('should retreive a 2 documents when provided 2 ids', function() {
    return setExpectedResultAndGetSearchPromise('array2').then(function(searchResult) {
      expect(searchResult.metadata.count).toEqual(2);
      expect(searchResult.metadata.url).toBeDefined();
      expect(searchResult.docs).toBeDefined();
      expect(searchResult.docs.length).toEqual(2);
    });
  });
});