'use strict';
/*
    Alibaba Cloud: Function to copy object to another oss bucket.
*/

const OSS = require('ali-oss').Wrapper;

module.exports.handler = async function(event, context, callback) {
    console.log('running...');

    //function is triggered by an event, get the object.
    const evt_lst = JSON.parse(event);
    const evt = evt_lst.events[0];

    const oss_region = 'oss-' + evt.region;
    const bucket_name = evt.oss.bucket.name;
    const object_name = evt.oss.object.key;
    const targetName = '/new/' + object_name;
    const sourceName = '/' + bucket_name + '/' + object_name;

    console.log('sourceName: ' + sourceName);
    console.log('targetName: ' + targetName);
    console.log('******');

    const store = new OSS({
        region: oss_region,
        internal: true,
        secure: true,
        accessKeyId: context.credentials.accessKeyId,
        accessKeySecret: context.credentials.accessKeySecret,
        stsToken: context.credentials.securityToken,
        bucket: 'csv-processing'
    });

    await store.copy(targetName, sourceName).then((result) => {
        console.log(result);
    }).catch ((err) => {
        console.error("Failed to copy object: %j", err);
        callback(err);
    });

    callback(null, 'done');
};