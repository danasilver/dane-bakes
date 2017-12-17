const Airtable = require('airtable');
const functions = require('firebase-functions');

const config = functions.config().airtable;
const base = new Airtable({apiKey: config.api_key}).base(config.base_id);

exports.getAllRecipes = function() {
  const recipes = [];

  return new Promise((resolve, reject) => {
    base('Recipes').select().eachPage((records, fetchNextPage) => {
      records.forEach(record => {
        recipes.push({
          id: record.getId(),
          name: record.get('Name'),
        });
      });

      fetchNextPage();

    }, function done(err) {
      if (err) reject(err);
      resolve(recipes);
    });
  });
};
