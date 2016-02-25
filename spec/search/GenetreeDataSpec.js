"use strict";

var Q = require('q');
var geneFixtures = require('../support/genetrees49');
var jasminePit = require('jasmine-pit');
var _ = require('lodash');

jasminePit.install(global);
require('jasmine-expect');

var setExpectedResultAndGetSearchPromise = require('../support/testSwaggerClientPromiseFactory')('genetrees', geneFixtures);

describe('geneData', function () {
  var searchInterface = require('../../src/searchInterface');
  var grameneSwaggerClient = require('../../src/grameneSwaggerClient');

  it('should have a method "searchInterface.genetrees" that returns a promise', function() {
    expect(searchInterface.genetrees).toBeDefined();
    expect(_.isFunction(searchInterface.genetrees)).toEqual(true);

    expect(_.isFunction(searchInterface.genetrees('EPlGT00140000001539').then)).toEqual(true);
  });

  pit('should fail when provided `undefined` as query', function() {
    return searchInterface.genetrees().catch(function(err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual('Query should be a string or an array. We were provided undefined');
    });
  });

  pit('should fail when provided object as query', function() {
    return searchInterface.genetrees({id:'EPlGT00140000001539'}).catch(function(err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual('Query should be a string or an array. We were provided object');
    });
  });

  pit('should retreive a single valid document when provided a single ID', function() {
    return setExpectedResultAndGetSearchPromise('single').then(function(searchResult) {
      expect(searchResult.metadata.validation.valid).toEqual(true);
      expect(searchResult.metadata.count).toEqual(1);
      expect(searchResult.metadata.url).toBeDefined();
      expect(searchResult.docs).toBeDefined();
      expect(searchResult.docs.length).toEqual(1);
    });
  });
});