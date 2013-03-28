var get = Ember.get, set = Ember.set;

var adapter, store, rsClient;
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

    Todo.toString = function() {
      return "App.Todo";
    };

    Todo.reopenClass({
      rs_type: 'todo',
      rs_module: 'todos'
    });

    rsClient = remoteStorage.todos.client;

    stop();
    remoteStorage.claimAccess('todos', 'rw').then(function() {
      start();
    });
  },

  teardown: function() {
    Ember.run(function() {
      adapter.destroy();
      store.destroy();
    });
    remoteStorage.flushLocal();
  }
});

var expectState = function(state, value, t) {
  t = t || todo;

  if (value === undefined) { value = true; }

  var flag = "is" + state.charAt(0).toUpperCase() + state.substr(1);
  equal(get(t, flag), value, "the todo is " + (value === false ? "not " : "") + state);
};

var expectStates = function(state, value) {
  todos.forEach(function(todo) {
    expectState(state, value, todo);
  });
};

test("existence", function() {
  ok(DS.RSAdapter, "RSAdapter added to DS namespace");
  ok(remoteStorage, "remoteStorage exists");
});

test("find", function() {
  var list = [];
  equal(list.length, 0, "list is empty");
});

asyncTest("create a todo", function() {
  expect(4);

  adapter.didCreateRecord = function(store, type, record, newObject) {
    equal(newObject["title"], "Homework");
    equal(type, "App.Todo");

    start();
  };

  Ember.run(function() {
    todo = store.createRecord(Todo, { title: "Homework" });
  });

  expectState("new");

  Ember.run(function() {
    store.commit();
    expectState("saving");
  });
});

asyncTest("find all todos", function() {
  expect(3);

  var newObject = rsClient.buildObject("todo", { title: "Homework", completed: true });
  rsClient.saveObject(newObject).then(function() {
    Ember.run(function() {
      todos = store.find(Todo);

      expectState('loaded');
    });
  });

  adapter.didFindAll = function(store, type, results) {
    var result = results[0];
    equal(result['title'], "Homework");
    equal(result['completed'], true);

    start();
  };
});
