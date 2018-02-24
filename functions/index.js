const airtable = require('./airtable');
const express = require('express');
const functions = require('firebase-functions');

const app = express();

app.get('/api/recipes', (request, response) => {
  airtable.getAllRecipes({
      sort: [{field: 'Baked on', direction: 'desc'}],
    })
    .then(recipes => response.json(recipes))
    .catch(err => response.sendStatus(500));
});

app.get('/api/recipe/:id', (request, response) => {
  airtable.getRecipe(request.param('id'))
    .then(recipe => response.json(recipe))
    .catch(err => response.sendStatus(500));
});

exports.api = functions.https.onRequest(app);
