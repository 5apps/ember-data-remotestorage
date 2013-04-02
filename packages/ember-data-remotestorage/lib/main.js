DS.LSSerializer = DS.JSONSerializer.extend({

  addBelongsTo: function(data, record, key, association) {
    data[key] = record.get(key + '.id');
  },

  addHasMany: function(data, record, key, association) {
    data[key] = record.get(key).map(function(record) {
      return record.get('id');
    });
  },

  extract: function(loader, json, type, record) {
    this._super(loader, this.rootJSON(json, type), type, record);
  },

  extractMany: function(loader, json, type, records) {
    this._super(loader, this.rootJSON(json, type, 'pluralize'), type, records);
  },

  rootJSON: function(json, type, pluralize) {
    var root = this.rootForType(type);
    if (pluralize === 'pluralize') { root = this.pluralize(root); }
    var rootedJSON = {};
    rootedJSON[root] = json;
    return rootedJSON;
  }

});

DS.RSAdapter = DS.Adapter.extend(Ember.Evented, {

  init: function() {
    this._super.apply(this, arguments);
  },

  serializer: DS.LSSerializer,

  find: function(store, type, id) {
    var rsType = type.remoteStorage.type;
    var rsClient = this._rsClient(type);
    var self = this;

    rsClient.getObject(id).then(
      function(result) {
        Ember.debug(result);
        delete(result['@type']);
        self.didFindRecord(store, type, result, id);
      }
    );
  },

  findAll: function(store, type) {
    var rsType = type.remoteStorage.type;
    var rsClient = this._rsClient(type);
    var self = this;

    rsClient.getAll('').then(
      function(response) {
        Ember.debug('response', response);
        var results = [];
        for (var id in response) {
          // TODO uses of didSaveRecord are not implemented properly yet
          // after deleting a record, the id is still in the response object
          if (typeof(response[id]) !== 'undefined') {
            result = response[id];
            self._removeJSONLDFields(result);
            results.push(Ember.copy(result));
          }
        }
        self.didFindAll(store, type, results);
      },
      function(error) {
        Ember.debug("error while fetching records", error);
      }
    );
  },

  createRecord: function(store, type, record) {
    rsType = type.remoteStorage.type;
    rsClient = this._rsClient(type);
    var self = this;

    Ember.debug("about to create single record");

    serialized = self._removeNullValues(record.serialize());
    newObject = rsClient.buildObject(rsType, serialized);
    rsClient.saveObject(newObject).then(
      function() {
        self._removeJSONLDFields(newObject);
        Ember.debug("created record", record, newObject);
        Ember.run(function() {
          self.didCreateRecord(store, type, record, newObject);
        });
      },
      function(error) {
        Ember.debug("error while saving record", error);
        if (error.errors) {
          store.recordWasInvalid(record, error.errors);
        } else {
          store.recordWasError(record);
        }
      }
    );
  },

  createRecords: function(store, type, records) {
    return this._super(store, type, records);
  },

  updateRecord: function(store, type, record) {
    Ember.debug("about to update record: ", record);

    rsType = type.remoteStorage.type;
    rsClient = this._rsClient(type);
    var self = this;

    var serialized = self._removeNullValues(record.serialize({includeId:true}));
    var id = record.get('id');

    rsClient.storeObject(rsType, id, serialized).then(
      function() {
        self._removeJSONLDFields(serialized);
        Ember.debug("updated record", record, serialized);
        Ember.run(function() {
          self.didSaveRecord(store, type, record, serialized);
        });
      },
      function(error) {
        Ember.debug("error while saving record", error);
        store.recordWasError(record);
      }
    );
  },

  updateRecords: function(store, type, records) {
    return this._super(store, type, records);
  },

  deleteRecord: function(store, type, record) {
    rsType = type.remoteStorage.type;
    rsClient = this._rsClient(type);
    var self = this;

    Ember.debug("about to delete record");

    var id = record.get('id');
    rsClient.remove(id).then(function() {
      Ember.debug('deleted record');
      Ember.run(function() {
        self.didDeleteRecord(store, type, record);
      });
    });
  },

  deleteRecords: function(store, type, records) {
    return this._super(store, type, records);
  },

  // private

  _removeNullValues: function(object) {
    //TODO should be handled in remoteStorage.js instead
    Object.keys(object).forEach(function(key) {
      if (object[key] == null) {
        delete(object[key])
      }
    });

    return object;
  },

  _removeJSONLDFields: function(object) {
    delete(object['@type']);
    delete(object['@context']);
  },

  _rsClient: function(type) {
    return eval('remoteStorage.'+type.remoteStorage.module+'.client');
  }

});
