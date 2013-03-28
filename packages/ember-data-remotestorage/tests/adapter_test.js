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

    remoteStorage.util.silenceAllLoggers();
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

asyncTest("find a single todo", function() {
  expect(4);

  var newObject = rsClient.buildObject("todo", { title: "Homework", completed: true });
  rsClient.saveObject(newObject).then(function() {
    Ember.run(function() {
      todos = store.find(Todo, newObject['id']);

      expectState('loaded');
    });
  });

  adapter.didFindRecord = function(store, type, result, id) {
    equal(result['title'], "Homework");
    equal(result['completed'], true);
    equal(id, newObject['id']);

    start();
  };
});

asyncTest("update a todo", function() {
  expect(3);

  var id;

  adapter.didSaveRecord = function(store, type, record, data) {
    equal(data['id'], id);
    equal(data['title'], 'Laundry');
    equal(data['completed'], true);

    start();
  };

  Ember.run(function() {
    todo = Todo.createRecord({ title: "Homework", completed: false });

    todo.addObserver('id', function() {
      todo.addObserver('stateManager.currentPath', function() {
        if (todo.get('stateManager.currentPath') === 'rootState.loaded.saved') {
          id = todo.get('id');
          todo.set('title', 'Laundry');
          todo.set('completed', true);
          store.commit();
        }
      });
    });

    store.commit();
  });
});

asyncTest("delete a record", function() {
  expect(2);

  var id;

  adapter.didDeleteRecord = function(store, type, record) {
    equal(type, "App.Todo");
    equal(id, record.get('id'));

    start();
  };

  Ember.run(function() {
    todo = Todo.createRecord({ title: "Homework", completed: false });

    todo.addObserver('id', function() {
      todo.addObserver('stateManager.currentPath', function() {
        if (todo.get('stateManager.currentPath') === 'rootState.loaded.saved') {
          id = todo.get('id');
          todo.deleteRecord();
          store.commit();
        }
      });
    });

    store.commit();
  });
});
