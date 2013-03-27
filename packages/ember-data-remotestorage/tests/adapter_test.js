var adapter, store;
var Todo, todo, todos;

module("DS.RSAdapter", {
  setup: function() {
    Ember.run(function() {
      adapter = DS.RSAdapter.create();
      store = DS.Store.create({adapter: adapter});
    });

    Todo = DS.Model.extend({
      title: DS.attr('string'),
      completed: DS.attr('boolean')
    });

    Todo.reopenClass({
      rs_type: 'todo',
      rs_module: 'todos'
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
