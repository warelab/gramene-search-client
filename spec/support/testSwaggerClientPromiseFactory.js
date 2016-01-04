"use strict";

var _ = require('lodash');
var Q = require('q');

var grameneSwaggerClient = require('../../src/grameneSwaggerClient');
var searchInterface = require('../../src/searchInterface');

function setExpectedResultAndGetSearchPromise(searchMethod, fixtures, name) {
  var fixture, promise, useLiveServer;

  if(!searchInterface[searchMethod]) {
    throw new Error(searchMethod + ' is not a moethod on the search interface client');
  }

  useLiveServer = !!process.env.useLiveServer;

  fixture = fixtures[name];

  // we are spying on the method called once the swagger client is initialized.
  // by convention this function uses the client to request data.
  // here we decide whether to use dummy data from the fixture (default)
  // or to call the REAL LIVE REMOTE SERVER.

  if(!useLiveServer) {
    spyOn(grameneSwaggerClient, 'then').and.returnValue(Q(_.cloneDeep(fixture.response)));
  }

  promise = searchInterface[searchMethod](fixture.query);

  // decorate promise with parsed but unprocessed response.
  promise.unprocessedResponse = fixture.response.obj;

  return promise;
}

module.exports = function factory(searchMethod, fixtures) {
  return _.partial(setExpectedResultAndGetSearchPromise, searchMethod, fixtures);
};