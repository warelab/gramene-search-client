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
    expect(suggesters.getSuggestUrl('GO_f')).toEqual('http://data.gramene.org/search/GO?');
  });

  it('should not provide a URL for anything that\'s not a suggester', function () {
    ['geness', '', undefined, new Date(), Array.prototype].map(function (notAcore) {
      var thrower = function () { suggesters.getSuggestUrl(notAcore) };
      expect(thrower).toThrow();
    });
  });

  it('should filter GO suggestions based on namespace', function () {
    var fParams = suggesters.getSuggestParams('GO_f', 'hello');
    var pParams = suggesters.getSuggestParams('GO_p', 'hello');
    var cParams = suggesters.getSuggestParams('GO_c', 'hello');

    expect(fParams.fq).toEqual("namespace_s:molecular_function");
    expect(pParams.fq).toEqual("namespace_s:biological_process");
    expect(cParams.fq).toEqual("namespace_s:cellular_component");
  });

  it('should produce correct results with handleSuggestResponse', function () {
    // given
    var WEIGHT_GENE = 1; // this is the number of docs with an id_exact of 'foo'
    var WEIGHT_DEFAULT = 77;
    var WEIGHT_TEXT = 3123;
    var response = {
      data: {
        response: {
          docs: [
            {ids_exact: ['foo', 'baz'], _terms: 'foo baz', _genes: WEIGHT_DEFAULT}
          ]
        },
        suggest: {
          terms: {
            'foo': {
              suggestions: [
                {term: 'foo', weight: WEIGHT_TEXT},
                {term: 'foobar', weight: 1}
              ]
            },
            'baz': {
              suggestions: [
                {term: 'bazzzz', weight: 4}
              ]
            }
          }
        }
      }
    };
    var queryString = 'foo';

    // when
    var handledGenesResponse = suggesters.handleSuggestResponse('genes', response, queryString);
    var handledTextResponse = suggesters.handleSuggestResponse('text', response, queryString);
    var handledDefaultResponse = suggesters.handleSuggestResponse('taxonomy', response, queryString);

    // then
    expect(handledGenesResponse[0].term).toEqual('foo');
    expect(handledGenesResponse[0].weight).toEqual(WEIGHT_GENE);
    expect(handledDefaultResponse[0].term).toEqual('<em>foo</em> baz');
    expect(handledDefaultResponse[0].weight).toEqual(WEIGHT_DEFAULT);
    expect(handledTextResponse[0].term).toEqual('foo');
    expect(handledTextResponse[0].weight).toEqual(WEIGHT_TEXT);
    expect(handledTextResponse[1].term).toEqual('foobar');
  });
})
;
