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

  it('should include default properties for distribution', function() {
    var rt = resultTypes.get('distribution');
    expect(rt.rows).toBeUndefined();
    expect(rt.start).toBeUndefined();
    expect(rt['facet.limit']).toEqual(-1);
    expect(rt['facet.mincount']).toEqual(1);
    expect(rt['facet.field']).toBeUndefined();
  });

  it('should rename facet properties to be facet-specific if facet.field is supplied as a param', function() {
    var rt = resultTypes.get('distribution', {'facet.field': 'foobar'});
    expect(rt.rows).toBeUndefined();
    expect(rt.start).toBeUndefined();
    expect(rt['facet.limit']).toBeUndefined();
    expect(rt['facet.mincount']).toBeUndefined();
    expect(rt['facet.field']).toEqual('foobar');
    expect(rt['f.foobar.facet.limit']).toEqual(-1);
    expect(rt['f.foobar.facet.mincount']).toEqual(1);
  });

  it('should rename facet properties supplied as custom params to be facet-specific if facet.field is supplied as a param', function() {
    var rt = resultTypes.get('list', {'facet.field': 'foobar', 'facet.lalalala': 'baz'});
    expect(rt.rows).toEqual(10);
    expect(rt.start).toEqual(0);
    expect(rt['facet.lalalala']).toBeUndefined();
    expect(rt['facet.field']).toEqual('foobar');
    expect(rt['f.foobar.facet.lalalala']).toEqual('baz');
  });

  it('should include default properties for facet and rename facet-specific properties for default facet.field', function() {
    var rt = resultTypes.get('facet');
    expect(rt.rows).toBeUndefined();
    expect(rt.start).toBeUndefined();
    expect(rt['facet.limit']).toBeUndefined();
    expect(rt['facet.mincount']).toBeUndefined();
    expect(rt['f.taxon_id.facet.limit']).toEqual(50);
    expect(rt['f.taxon_id.facet.mincount']).toEqual(0);
    expect(rt['facet.field']).toEqual('taxon_id');
  });
});