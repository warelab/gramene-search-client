"use strict";

function swaggerResponseValidatorPromiseFactory(response) {
  var client, data, validation;

  client = response.client;
  data = response.obj;

  if(client && client.validateModel) {
    validation = client.validateModel("SolrGeneResponse", data);

    if (!validation.valid) {
      console.warn(validation.GetFormattedErrors());
    }
  }
  else {
    //console.warn('Validation method `validateModel` not present on grameneSwaggerClient');
  }

  return response;
}

module.exports = swaggerResponseValidatorPromiseFactory;