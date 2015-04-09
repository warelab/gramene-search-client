'use strict';

require('jasmine-expect');
var _ = require('lodash');

describe('solrCores', function () {

  var solrCores, allCores;

  beforeEach(function () {
    solrCores = require('../../src/solrCores');
  });

  it('should provide a URL for a search core', function () {
    ['genes', 'taxonomy', 'interpro', 'GO', 'PO'].map(function (core) {
      var url = solrCores.getUrlForCore(core);
      expect(url).toStartWith('http://data.gramene.org/');
      expect(url).toEndWith(core + '?');
    });
  });

  it('should not provide a URL for anything that\'s not a search core', function () {
    ['geness', '', undefined, new Date(), Array.prototype].map(function (notAcore) {
      var thrower = function () { solrCores.getUrlForCore(notAcore) };
      expect(thrower).toThrow();
    });
  });

  it('should provide a display name if available otherwise return the provided argument', function () {
    _.map({
      taxon_id: {displayName: 'Species'},
      interpro_xrefi: {displayName: 'Domain'},
      GO_xrefi: {displayName: 'GO'},
      PO_xrefi: {displayName: 'PO'}
    }, function (xref, name) {
        expect(solrCores.getXrefDisplayName(name)).toEqual(xref.displayName);
      });

    ['hello', undefined, new Date()].map(function(notAnXref) {
      expect(solrCores.getXrefDisplayName(notAnXref)).toEqual(notAnXref);
    })
  });

  it('should tell me which fields look like they will have numeric values', function() {
    ['fixed_200_bin', 'interpro_xrefi', 'bin_thing', 'taxon_id', 'start', 'end', 'strand'].map(function(fieldWithNumericData) {
      expect(solrCores.valuesAreNumeric(fieldWithNumericData)).toBeTruthy();
    });

    [undefined, 'system_name', 'domainRoots', 'eg_gene_tree', new Date()].map(function(notAFieldWithNumericData) {
      expect(solrCores.valuesAreNumeric(notAFieldWithNumericData)).toBeFalsy();
    })
  });
});
