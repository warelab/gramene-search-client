var _ = require('lodash');

var helpers = {
  params: {
    default: function defaultSuggestParams(queryString) {
      queryString += '*';
      if (queryString.match(/\s/)) {
        queryString = '\'' + queryString + '\'';
      }
      return {
        q: queryString,
        fl: '_terms,id,_genes,id_s,name_s',
        sort: '_genes desc'
      };
    },

    text: function textSuggestParams(queryString) {
      return {
        q: queryString
      }
    },

    genes: function genesSuggestParams(queryString) {
      queryString += '*';
      if (queryString.match(/\s/)) {
        queryString = '\'' + queryString + '\'';
      }
      return {
        q: 'ids:' + queryString,
        fl: 'id,ids_exact,name',
        rows: 200
      };
    },

    goFactory: function goParamsFactory(goNamespace) {
      return function goParams(queryString) {
        var result = helpers.params.default(queryString);
        result.fq = "namespace_s:" + goNamespace;
        return result
      }
    }
  },

  formatters: {
    forFqField: function forFqFieldFactory(fqField) {
      return function suggestFormatter(response, queryString) {
        // this function reformats the responses from the aux cores
        // there is another defined for genes
        var reList = queryString.split(/\s/);
        for (var i = 0; i < reList.length; i++) {
          var term = reList[i];
          if (i + 1 == reList.length) {
            reList[i] = new RegExp('\\b(' + term + ')', 'gi');
          }
          else {
            reList[i] = new RegExp('\\b(' + term + ')\\b', 'gi');
          }
        }

        return response.data.response.docs.map(function (doc) {
          var hl = doc._terms;
          reList.forEach(function (re) {
            hl = hl.replace(re, '<em>$1</em>');
          });
          hl = hl.replace(/\S+\s\|\s/, '');
          return {
            term: hl,
            weight: doc._genes,
            fq: fqField + ':' + doc.id,
            name: doc.name_s,
            id: doc.id_s
          };
        });
      }
    },

    text: function textSuggestFormatter(response, queryString) {
      var suggestions = response.data.suggest.terms[queryString].suggestions;
      return suggestions.map(function (sug) {
        var cleanTerm = sug.term.replace(/<\/?b>/g, '');
        sug.term = sug.term.replace(/b>/g, 'em>');
        sug.fq = 'text:' + cleanTerm;
        sug.label = cleanTerm;
        delete(sug.payload);
        return sug;
      });
    },

    genes: function genesSuggestFormatter(response, queryString) {
      var queryRegexp = new RegExp('\\b' + queryString, 'i');
      var suggestions = _(response.data.response.docs)
        .forEach(function (doc) {
          doc.queriedId = _.find(doc.ids_exact, function (id) {
            return !!id.match(queryRegexp);
          });
        })
        .groupBy('queriedId')
        .map(function (listOfDocs, queriedId) {
          var doc, numDocs;
          doc = _.first(listOfDocs);
          numDocs = listOfDocs.length;
          return {
            term: queriedId,
            weight: numDocs,
            fq: 'ids:' + queriedId,
            name: doc.name,
            id: doc.id
          };
        })
        .sort('weight')
        .slice(0, 10);

      return suggestions.value();
    }
  }
};

module.exports = helpers;