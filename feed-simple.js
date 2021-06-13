'use strict';
const alfy = require('alfy');
const basedFeed = Buffer.from(alfy.input).toString('base64').replace('/', '_').replace('+', '-');

alfy.output([{
    title: 'Open feed in Steno.fm',
    arg: basedFeed
}]);