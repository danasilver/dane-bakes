const airtable = require('./airtable');
const storage = require('./storage');
const cors = require('cors');
const express = require('express');
const functions = require('firebase-functions');
const gcs = require('@google-cloud/storage')();
const request = require('request-promise');

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

exports.fetchBake = functions.firestore.document('bakes/{bakeId}')
  .onCreate(event => {
    const airtableUrl = event.data.get('airtableUrl');
    const airtableUrlParts = airtableUrl.split('/');
    const airtableBakeId = airtableUrlParts[airtableUrlParts.length - 1];

    console.log('Fetching bake %s from url %s', airtableBakeId, airtableUrl);

    return airtable.getBake(airtableBakeId)
      .then(bake => {
        return airtable.getRecipe(bake['Recipe'][0])
          .then(recipe => {
            return {recipe, bake};
          });
      })
      .then(({recipe, bake}) => {
        return event.data.ref.set({
          date: Date.parse(`${bake['Date']} PST`),
          recipeName: recipe['Name'],
          instagramUrl: bake['Instagram'],
        }, {merge: true});
      })
      .catch(err => {
        console.error('Error fetching bake %s from Airtable', airtableBakeId);
        console.error(err);
      });
  });

exports.saveInstagramToGCS = functions.firestore.document('bakes/{bakeId}')
  .onUpdate(event => {
    const instagramUrl = event.data.get('instagramUrl');

    if (!instagramUrl) {
      console.log('No instagram url to download for bakeId %s', event.data.id);
      return;
    }

    return request({
      uri: `https://api.instagram.com/oembed/?url=${instagramUrl}`,
      json: true,
    })
    .then(instagramData => {
      console.log('Fetched instagram data for %s. Caching image %s in GCS.',
        instagramUrl, instagramData.thumbnail_url);
      return storage.cacheImage(instagramData.thumbnail_url);
    })
    .then(publicPath => {
      event.data.ref.set({
        instagramGcsUrl: publicPath,
      }, {merge: true});
    });
});
