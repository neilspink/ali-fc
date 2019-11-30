'use strict';
/*
    Alibaba Cloud: Function to output event object to log as base64. Use a service like https://www.base64decode.org/
    to decode.
*/

const OSS = require('ali-oss').Wrapper;

module.exports.handler = function (event, context, callback) {
    console.log('base64 of event');

    let buff = new Buffer(event);
    let base64data = buff.toString('base64');

    console.log(base64data);

    callback(null, 'finished!');
};
