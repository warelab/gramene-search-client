'use strict';

require('jasmine-expect');
var _ = require('lodash');

describe('suggesters', function () {

  var suggesters;

  beforeEach(function () {
    suggesters = require('../../src/suggesters');
  });

  it('should provide a URL for making suggestions', function () {
    expect(suggesters.getSuggestUrl('text')).toEqual('http://data.gramene.org/suggest/genes?');
    expect(suggesters.getSuggestUrl('GO')).toEqual('http://data.gramene.org/search/GO?');
  });

  it('should not provide a URL for anything that\'s not a suggester', function () {
    ['geness', '', undefined, new Date(), Array.prototype].map(function (notAcore) {
      var thrower = function () { suggesters.getSuggestUrl(notAcore) };
      expect(thrower).toThrow();
    });
  });
});
