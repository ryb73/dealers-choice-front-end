"use strict";

var q = require("q");

function loadUser(userId) {
  var deferred = q.defer();

  FB.api("/" + userId,
    {
      fields: [ "id", "name", "picture" ]
    },
    function(response) {
      if(response.error) {
        deferred.reject(response.error);
        return;
      }

      deferred.resolve(new User(response));
    }
  );
}

function User($response) {
  var id = $response.id;
  var name = $response.name;
  var imgSrc = $response.picture.data.url;
  $response = null;

  Object.defineProperties(this, {
    id: {
      enumerable: true,
      get: function() { return id; }
    },
    name: {
      enumerable: true,
      get: function() { return name; }
    },
    imgSrc: {
      enumerable: true,
      get: function() { return imgSrc; }
    },
  });
}

module.exports = loadUser;