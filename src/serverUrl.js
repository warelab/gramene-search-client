'use strict';

var queryString = require('query-string');
var HARDCODED_SERVER = "http://data.gramene.org/swagger";

function determineServerUrl(){
  var server;

  if(global) {
    if (global.location && global.location.search) {
      server = queryString.parse(global.location.search).server;

      if (server) {
        return server;
      }
    }

    if(global.gramene && global.gramene.defaultServer) {
      return global.gramene.defaultServer;
    }
  }

  return HARDCODED_SERVER;
}

determineServerUrl.HARDCODED_SERVER = HARDCODED_SERVER;

module.exports = determineServerUrl;