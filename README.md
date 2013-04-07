# Ember Data remoteStorage Adapter

This library provides an adapter for [Ember Data](http://github.com/emberjs/data) for allowing to store application models in [remoteStorage](http://remotestorage.io).

It is currently tested against Ember Data revision 11.

## Usage

Include `ember-data-remotestorage.js` in your app and tell your store to use it:

```javascript
App.Store = DS.Store.extend({
	revision: 11,
	adapter: DS.RSAdapter.create()
});
```

Every remoteStorage module you want to use needs to define a common data type using JSON Schema and at least export the private client as `client`:

```javascript
remoteStorage.defineModule('tasks', function(privateClient, publicClient) {

  // Define a common data type using JSON Schema
  privateClient.declareType('task', {
    "description": "a task",
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "format": "id"
      },
      "title": {
        "type": "string"
      },
      "completed": {
        "type": "boolean"
      }
    }
  });

  return {
    exports: {
      client: privateClient
    }
  };
});
```

On your Ember model you specify the attributes as usual:

```javascript
App.Todo = DS.Model.extend({
	title: DS.attr('string'),
	completed: DS.attr('boolean')
});
```

You also need to define the module _name_ and _type_ on the model's class:

```javascript
App.Todo.reopenClass({
  remoteStorage: {
    module: 'tasks',
    type: 'task'
  }
});
```

## Todo

* Relationships between two or more Ember models are not supported yet.

## Helpful Commands

* `bundle exec rake test` to run tests in phantomjs
* `bundle exec rackup` to run tests in the browser
* `bundle exec rake dist` to build the project
* `bundle exec ember:autotest` to automatically re-run tests when files change (OS X only)

## License

This library is released under the MIT license.
