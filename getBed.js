#!/usr/env node
var argv = require('minimist')(process.argv.slice(2));

var url = argv.swagger || 'http://brie:10050/swagger';
var feature = argv.feature || 'gene';
var combiner = argv.combiner || 'canonical';
var idFile = argv.ids || '/dev/fd/0';
var batchSize = argv.batchSize || 1000;

global.gramene = {defaultServer: url};
var gramene = require('./src/grameneSwaggerClient');

var ids = [];
require('readline').createInterface({
  input: require('fs').createReadStream(idFile),
  terminal: false
})
.on('line', function(line) {
  ids.push(line);
})
.on('close', function() {
  gramene.then(function(client) {
    for(var i=0; i<ids.length; i+=batchSize) {
      client['Data access'].genes(
        {
          rows: batchSize,
          wt: 'bed',
          bedFeature: feature,
          bedCombiner: combiner,
          idList: ids.slice(i, i+batchSize)
        }, function(res) {
          console.log(res.data);
        }
      )
    }
  })
})
