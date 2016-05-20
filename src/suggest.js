'use strict';

var _ = require('lodash');

var grameneSwaggerClient = require('./grameneSwaggerClient');
var validate = require('./validate');

function makeCall(gramene, queryString, taxa) {
  var params = {
    q: '*'
  };
  if (queryString) {
    params.q = '{!boost b=relevance}'
    + 'name:' + queryString + '^3'
    + ' id:' + queryString + '^5'
    + ' synonym:' + queryString + '^2'
    + ' text:' + queryString + '*^1'
  }
  // if ( ! _.isEmpty(taxa)) {
  //   params.fq = 'taxon_id:(' + Object.keys(taxa).join(' ') + ')';
  // }
  return gramene['Search'].suggestions(params).then(function(res) {
    res.client = gramene;
    return res;
  });
}

function reformatResponseTaxa(queryString, taxa) {
  return function reformatResponse(response) {
    var query, category, categories;
    query = _.get(response, 'obj.responseHeader.params.q');

    // remove the trailing '*'
    if (query && query.length) {
      query = query.slice(0, -1);
    }

    category = _.get(response, 'obj.grouped.category');
    categories = _.get(response, 'obj.grouped.category.groups');

    if (categories) {
      // the following line is a safer equivalent of
      // `return response.obj.grouped.category.groups.map(function(category) {`
      categories = categories.map(function reformatSuggestionCategory(category) {
        var doclist = category.doclist;
        if (!category.doclist) {
          console.error('No doclist for category ', category);
          return;
        }

        if (!_.isEmpty(taxa)) {
          doclist.docs.forEach(function(doc) {
            doc.num_genes = 0;
            for(var i=0;i<doc.taxon_id.length;i++) {
              if (taxa.hasOwnProperty(doc.taxon_id[i])) {
                doc.num_genes += doc.taxon_freq[i];
              }
            }
          });
        }

        return {
          label: category.groupValue,
          suggestions: doclist.docs,
          max_score: doclist.maxScore,
          num_found: doclist.numFound
        }
      });
    }

    return {
      metadata: {
        query: queryString,
        count: category.matches,
        url: response.url,
        validation: response.validation
      },
      categories: categories
    }
  }
}

function promise(queryString, taxa) {
  return grameneSwaggerClient
    .then(function(client) {
      return makeCall(client, queryString, taxa);
    })
    .then(validate("SolrSuggestResponse"))
    .then(reformatResponseTaxa(queryString, taxa));
}


module.exports = {
  makeCall: makeCall,
  reformatResponse: reformatResponseTaxa(),
  promise: promise
};
