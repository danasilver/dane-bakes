const airtable = require('./airtable');
const functions = require('firebase-functions');


exports.listRecipes = functions.https.onRequest((request, response) => {
  airtable.getAllRecipes()
    .then(recipes => response.json(recipes))
    .catch(err => response.sendStatus(500));
});
