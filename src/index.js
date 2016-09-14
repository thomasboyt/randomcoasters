'use strict';

process.on('unhandledRejection', (err) => {
  if (err.stack) {
    console.error(err.stack);
  } else {
    console.error(err);
  }
  process.exit(1);
});

const sampleSize = require('lodash.samplesize');
const Twit = require('twit');
const axios = require('axios');
const cheerio = require('cheerio');
const secret = require('./secret');

const T = new Twit({
  consumer_key: secret.consumer_key,
  consumer_secret: secret.consumer_secret,
  access_token: secret.access_token,
  access_token_secret: secret.access_token_secret,
});

function getCoaster() {
  return axios.get('https://rcdb.com/')
    .then((resp) => {
      const $ = cheerio.load(resp.data);

      const link = $('#rrc #rrc_text p a').first().attr('href');

      return axios.get(`https://rcdb.com${link}`);

    }).then((resp) => {
      const $ = cheerio.load(resp.data);
      const name = $('#feature h1').text();
      const park = $('#feature a').first().text();
      const url = resp.config.url;

      const pictureUrls = $('#pic_data div').map((i, el) => $(el).data('url')).get();

      return {name, park, url, pictureUrls};
    });
}

function getImage(pictureUrl) {
  return axios.get(`https://rcdb.com${pictureUrl}`, {
    responseType: 'arraybuffer',
  }).then((resp) => {
    const image = resp.data.toString('base64');
    return image;
  });
}

function uploadImage(pictureUrl) {
  return getImage(pictureUrl).then((b64Image) => {
    return T.post('media/upload', {media_data: b64Image});
  }).then((result) => {
    return result.data.media_id_string;
  });
}

function tweetCoaster(params) {
  const urls = sampleSize(params.pictureUrls, 3)

  return Promise.all(urls.map(uploadImage)).then((imageIds) => {
    // TODO: Ensure there is always room for url, status is not truncated
    return T.post('/statuses/update', {
      status: `${params.name} in ${params.park} - ${params.url}`,
      media_ids: imageIds
    });
  });
}

exports.handler = function(event, context) {
  getCoaster().then(tweetCoaster).then((result) => {
    console.log(result.data);
    context.succeed();

  }).catch((err) => {
    console.log('errored:');

    if (err.stack) {
      console.log(err.stack);
    } else {
      console.log(err);
    }

    context.fail();
  })
}