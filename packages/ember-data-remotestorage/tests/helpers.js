remoteStorage.defineModule('todos', function(privateClient) {

  privateClient.declareType('todo', {
    "description": "a task",

    "type": "object",

    "properties": {
      "id": {
        "description": "unique identifier",
        "type": "string",
        "format": "id"
      },

      "title": {
        "description": "formatted name",
        "type": "string"
      },

      "completed": {
        "description": "",
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
