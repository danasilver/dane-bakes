const admin = require('firebase-admin');
const functions = require('firebase-functions');
const gcs = require('@google-cloud/storage');
const request = require('request');
const uuid = require('uuid/v4');
const crypto = require('crypto');

admin.initializeApp(functions.config().firebase);

const bucket = admin.storage().bucket();

function upload(imageUrl, path) {
  return new Promise((resolve, reject) => {
    request.get(imageUrl, {encoding: null})
      .pipe(bucket.file(path).createWriteStream({
        metadata: {
          contentType: 'image/jpg',
        }
      }))
      .on('finish', () => {
        resolve(bucket.file(path).makePublic()
          .then(() => path));
      })
      .on('error', reject);
  });
};

function exists(path) {
  return bucket.file(path).exists()
    .then(data => data[0]);
};

function gcsPath(imageUrl) {
  return `bakes/photos/${checksum(imageUrl)}.jpg`;
}

function gcsPublicUrl(path) {
  return `https://storage.googleapis.com/dane-bakes.appspot.com/${path}`;
}

function checksum(s) {
  return crypto
    .createHash('md5')
    .update(s, 'utf8')
    .digest('hex');
}

exports.cacheImage = function(imageUrl) {
  const path = gcsPath(imageUrl);

  return exists(path)
    .then(exists => {
      if (!exists) {
        console.log('Path %s does not exist. Uploading image.', path);
        return upload(imageUrl, path);
      }

      console.log('Path %s exists. Not uploading image.', path);
      return path;
    })
    .then(gcsPublicUrl);
}
