const Airtable = require('airtable');
const functions = require('firebase-functions');

const config = functions.config().airtable;
const base = new Airtable({apiKey: config.api_key}).base(config.base_id);

exports.getAllRecipes = function(query) {
  const recipes = [];

  return new Promise((resolve, reject) => {
    base('Recipes').select(query).eachPage((records, fetchNextPage) => {
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

exports.getRecipe = function(id) {
  return new Promise((resolve, reject) => {
    base('Recipes').find(id, (err, record) => {
      if (err) return reject(err);
      resolve(record.fields);
    });
  }); 
};

exports.getBake = function(id) {
  return new Promise((resolve, reject) => {
    base('Bakes').find(id, (err, record) => {
      if (err) return reject(err);
      resolve(record.fields);
    });
  }); 
}
