/* jshint strict: global */
"use strict";

var q = require("q");

function loadUser(userId) {
  var deferred = q.defer();

  console.log("loadUser", userId);

  FB.api("/" + userId,
    {
      fields: [ "id", "name", "picture.width(100).height(100)" ]
    },
    function(response) {
      if(response.error) {
        deferred.reject(response.error);
        return;
      }

      var user = userObj(response);
      deferred.resolve(user);
    }
  );

  return deferred.promise;
}

function userObj(apiResponse) {
  return {
    id: apiResponse.id,
    name: apiResponse.name,
    imgSrc: apiResponse.picture.data.url
  };
}

module.exports = loadUser;