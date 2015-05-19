'use strict';

describe('resultTypes', function() {
  var resultTypes;

  beforeEach(function() {
    resultTypes = require('../../src/resultTypes');
  });

  it('should return default result types when requested', function() {
    expect(resultTypes.get('list')).toBeDefined();
    expect(resultTypes.get('distribution')).toBeDefined();
    expect(resultTypes.get('facet')).toBeDefined();
    expect(resultTypes.get('tally')).toBeDefined();
  });

  it('should not return anything for an argument that is not a result type', function() {
    expect(resultTypes.get('sausage')).toBeUndefined();
    expect(resultTypes.get('sausage', {foo:'bar'})).toBeUndefined();
    expect(resultTypes.get(new Date())).toBeUndefined();
    expect(resultTypes.get(resultTypes)).toBeUndefined();
    expect(resultTypes.get()).toBeUndefined();
  });

  it('should include default properties for list', function() {
    var rt = resultTypes.get('list');
    expect(rt.rows).toEqual(10);
    expect(rt.start).toEqual(0);
    expect(rt['facet.limit']).toBeUndefined();
    expect(rt['facet.mincount']).toBeUndefined();
    expect(rt['facet.field']).toBeUndefined();
  });

  it('should include default properties for tally', function() {
    var rt = resultTypes.get('tally');
    expect(rt['json.facet']).toBeDefined();
    expect(rt.start).toBeUndefined();
    expect(rt['facet.limit']).toBeUndefined();
    expect(rt['facet.mincount']).toBeUndefined();
    expect(rt['facet.field']).toBeUndefined();
  });

  it('should include default properties for distribution', function() {
    var rt = resultTypes.get('distribution');
    expect(rt.rows).toBeUndefined();
    expect(rt.start).toBeUndefined();
    expect(rt['facet.limit']).toEqual(-1);
    expect(rt['facet.mincount']).toEqual(1);
    expect(rt['facet.field']).toBeUndefined();
  });

  it('should create SOLR local params facet.field and key are supplied as a param', function() {
    var rt = resultTypes.get('distribution', {'facet.field': 'foobar', key: 'baz'});
    expect(rt.rows).toBeUndefined();
    expect(rt.start).toBeUndefined();
    expect(rt['facet.limit']).toBeUndefined();
    expect(rt['facet.mincount']).toBeUndefined();
    expect(rt['facet.field']).toEqual("{!facet.limit='-1' facet.mincount='1' key='baz'}foobar");
  });

  it('should set the key to be the same as the facet.field if one is not supplied', function() {
    var rt = resultTypes.get('distribution', {'facet.field': 'foobar'});
    expect(rt.rows).toBeUndefined();
    expect(rt.start).toBeUndefined();
    expect(rt['facet.limit']).toBeUndefined();
    expect(rt['facet.mincount']).toBeUndefined();
    expect(rt['facet.field']).toEqual("{!facet.limit='-1' facet.mincount='1' key='foobar'}foobar");
  });

  it('should create SOLR local params from properties supplied as custom params if facet.field and key are supplied as params', function() {
    var rt = resultTypes.get('facet', {'facet.field': 'foobar', 'facet.lalalala': 'baz', key:'xyzzy'});
    expect(rt['facet.lalalala']).toBeUndefined();
    expect(rt.key).toBeUndefined();
    expect(rt['facet.field']).toEqual("{!facet.limit='50' facet.mincount='0' facet.lalalala='baz' key='xyzzy'}foobar");
  });

  it('should include default properties for facet and rename facet-specific properties for default facet.field', function() {
    var rt = resultTypes.get('facet');
    expect(rt.rows).toBeUndefined();
    expect(rt.start).toBeUndefined();
    expect(rt['facet.limit']).toBeUndefined();
    expect(rt['facet.mincount']).toBeUndefined();
    expect(rt['facet.field']).toEqual("{!facet.limit='50' facet.mincount='0' key='taxon_id'}taxon_id");
  });
});