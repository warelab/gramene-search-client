"use strict";

function swaggerResponseValidatorPromiseFactory(modelName) {
  return function swaggerResponseValidatorPromise(response) {
    var client, data, validation;

    client = response.client;
    data = response.obj;

    if(client && client.validateModel) {
      validation = client.validateModel(modelName, data);

      if (!validation.valid) {
        console.warn(validation.GetFormattedErrors());
      }
    }
    else {
      //console.warn('Validation method `validateModel` not present on grameneSwaggerClient');
    }

    return response;
  }
}

module.exports = swaggerResponseValidatorPromiseFactory;