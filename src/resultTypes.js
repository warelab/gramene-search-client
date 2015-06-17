'use strict';

var _ = require('lodash');

var resultTypes = {
  list: {
    rows: 10,
    start: 0
  },
  distribution: {
    'facet.limit': -1,
    'facet.mincount': 1
  },
  facet: {
    'facet.limit': 50,
    'facet.mincount': 0,
    'facet.field': 'taxon_id'
  },
  tally: {
    'json.facet' : {
      'species' : 'unique(taxon_id)',
      'biotype' : 'unique(biotype)',
      'GO'      : 'unique(GO_xrefi)',
      'PO'      : 'unique(PO_xrefi)',
      'domains' : 'unique(interpro_xrefi)',
      'epl_gene_tree' : 'unique(epl_gene_tree)'
    }
  }
  // TODO consider adding `pivot` result type, e.g. for gene_tree analysis we'd like to do this: http://data.gramene.org/search/genes?q=*&rows=0&facet=true&facet.pivot=grm_gene_tree_root_taxon_id,grm_gene_tree
};

module.exports = {
  get: function (type, details) {
    var rt = _.cloneDeep(resultTypes[type]),
        facetField, kvpStringArray;

    if(!rt) return;

    // details are specific configurations for this 'instance' of
    // the result type, e.g. facet field.
    if (details) {

      // add the details to the object
      _.assign(rt, details);
    }

    // if 'facet.field' and 'key' are defined then we are faceting. Refactor all
    // properties into a string that fits the SOLR syntax for LocalParams
    // described here http://wiki.apache.org/solr/LocalParams

    /* e.g/

    {
      'facet.field': 'foo',
      key: 'bar',
      'facet.mincount': -1,
      'facet.limit': 10
    }

    will become
    {
      'facet.field': '{!key=bar facet.mincount=-1 facet.limit=10}foo'
    }

    We do this to encapsulate properties, and allow the same facet.field
    to be faceted more than once.
     */

    facetField = rt['facet.field'];
    if (facetField) {
      delete rt['facet.field'];
      if(!rt.key) rt.key = facetField;
      kvpStringArray = _.map(rt, function(propVal, propKey) {
        return propKey + '=\'' + propVal + '\'';
      });

      rt = {
        'facet.field': '{!' + kvpStringArray.join(' ') + '}' + facetField
      }
    }

    return rt;
  }
};