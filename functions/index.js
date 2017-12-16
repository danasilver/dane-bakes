const Airtable = require('airtable');
const functions = require('firebase-functions');


exports.listRecipes = functions.https.onRequest((request, response) => {
  const base = getBase();
  const names = [];

  base('Recipes').select()
    .eachPage((records, fetchNextPage) => {
      records.forEach(function(record) {
        names.push(record.get('Name'));
      });

      fetchNextPage();

    }, function done(err) {
      if (err) {
        return response.sendStatus(500);
      }

      return response.json({records: names});
    });
});

function getBase() {
  const airtable = functions.config().airtable;
  return new Airtable({apiKey: airtable.api_key}).base(airtable.base_id);
}
