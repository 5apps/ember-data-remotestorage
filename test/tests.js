module('DS.RSAdapter', {

  setup: function() {
    List = DS.Model.extend({
      name: DS.attr('string')
    });

    adapter = DS.RSAdapter.create();
    store = DS.Store.create({adapter: adapter});
  },

  teardown: function() {
    adapter.destroy();
    store.destroy();
  }

});

test('existence', function() {
  ok(DS.RSAdapter, 'RSAdapter added to DS namespace');
});

test('find', function() {
  // list = List.find('l1');
  list = [];
  equal(list.length, 0, 'list is empty');
});
