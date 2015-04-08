var axios = require('axios');
var Q = require('q');
var resultFixtures = require('../support/searchResult');

describe('searchInterface', function () {

  var searchInterface, expectedResult;

  beforeEach(function () {
    searchInterface = require('../../src/searchInterface');
  });

  function setExpectedResult(name) {
    name |= 'default';
    expectedResult = Q(resultFixtures[name]);
    spyOn(axios, 'get').andReturn(expectedResult);
  }

  it('should request data in default state', function () {
    // when
    setExpectedResult('default');
    searchInterface.geneSearch().then(function(searchResult) {
      expect(searchResult).toBeDefined();
    });

    // then
    var args = axios.get.mostRecentCall.args;
    expect(args.length).toEqual(2);

    var params = args[1].params;
    expect(args[0]).toEqual('http://data.gramene.org/44/search/genes?');
    expect(params.q).toEqual('*');
    expect(params.rows).toEqual(0);
    expect(params.facet).toEqual(true);
  });
});