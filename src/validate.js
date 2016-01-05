"use strict";

function swaggerResponseValidatorPromiseFactory(modelName) {
  if(!modelName) {
    throw new Error("No modelName supplied");
  }

  return function swaggerResponseValidatorPromise(response) {
    var client, data, validation;

    if(!response || !response.obj) {
      throw new Error("Bad Response");
    }

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