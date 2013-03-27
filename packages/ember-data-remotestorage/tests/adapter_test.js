var adapter, store, List;

module("DS.RSAdapter", {
  setup: function() {
    Ember.run(function() {
      List = DS.Model.extend({
        name: DS.attr('string')
      });

      adapter = DS.RSAdapter.create();
      store = DS.Store.create({adapter: adapter});
    });
  },

  teardown: function() {
    Ember.run(function() {
      adapter.destroy();
      store.destroy();
    });
  }
});

test("existence", function() {
  ok(DS.RSAdapter, "RSAdapter added to DS namespace");
  ok(remoteStorage, "remoteStorage exists");
});

test("find", function() {
  var list = [];
  equal(list.length, 0, "list is empty");
});
