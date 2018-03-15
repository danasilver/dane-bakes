const airtable = require('./airtable');
const cors = require('cors');
const express = require('express');
const functions = require('firebase-functions');

const app = express();

if (functions.config().environment === 'development') {
  app.use(cors());
}

app.get('/recipes', (request, response) => {
  airtable.getAllRecipes({
      sort: [{field: 'Baked on', direction: 'desc'}],
    })
    .then(recipes => response.json(recipes))
    .catch(err => response.sendStatus(500));
});

app.get('/recipe/:id', (request, response) => {
  airtable.getRecipe(request.params.id)
    .then(recipe => response.json(recipe))
    .catch(err => response.sendStatus(500));
});

app.get('/bake/:id', (request, response) => {
  airtable.getBake(request.params.id)
    .then(recipe => response.json(recipe))
    .catch(err => response.sendStatus(500));
});

exports.api = functions.https.onRequest(app);
