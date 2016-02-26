'use strict';

describe('serverUrl', function() {
  var serverUrl = require('../../src/serverUrl');

  beforeEach(function() {
    //noinspection JSUnresolvedVariable
    global = {};
  });

  it('should default to hardcoded default value', function() {
    // given default global state

    // when
    var url = serverUrl();

    // expect
    expect(url).toEqual(serverUrl.HARDCODED_SERVER);
  });

  it('if server prop is defined, use that', function() {
    // given a location
    global.location = { search: '?server=bar' };

    // when
    var url = serverUrl();

    // expect
    expect(url).toEqual('bar');
  });

  it('if default server is defined, use that', function() {
    // given gramene globals
    global.gramene = { defaultServer: 'baz' };

    // when
    var url = serverUrl();

    // expect
    expect(url).toEqual('baz');
  });

  it('if default server and server search parameter are defined, use the latter', function() {
    // given a location and gramene globals
    global.location = { search: '?server=bar' };
    global.gramene = { defaultServer: 'baz' };

    // when
    var url = serverUrl();

    // expect
    expect(url).toEqual('bar');
  });

});
