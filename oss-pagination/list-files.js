'use strict';
/*
    Alibaba Cloud: Find and list object from an OSS that have a last modified timestame of today.
*/

const OSS = require('ali-oss').Wrapper;

const oss_region = 'oss-cn-shanghai';
const bucket_name = '<yourBucketName>';
const object_prefix = '';

async function objectsModifiesToday(context) {

    const today = new Date();

    let truncated = false;
    let nextMarker = '';
    let result = [];

    const store = new OSS({
        region: oss_region,
        internal: true,
        secure: true,
        accessKeyId: context.credentials.accessKeyId,
        accessKeySecret: context.credentials.accessKeySecret,
        stsToken: context.credentials.securityToken,
        bucket: bucket_name
    });

    do {
        const objectsRequest = {
            Prefix: object_prefix,
            marker: nextMarker,
            ['max-keys']: 100
        }

        const search = await store.list(objectsRequest);

        search.objects.forEach(item => {

            let lastModified = new Date(Date.parse(item.lastModified));

            if (today.toDateString() === lastModified.toDateString()) {
                result.push(item);
            }
        });

        truncated = result.isTruncated;
        nextMarker = result.nextMarker;
    } while (truncated === true)

    return result;
}

module.exports.handler = async function(event, context, callback) {
    console.log('running...');

    await objectsModifiesToday(context).then(files => {
        console.log(files);
    }).catch(ex => {
        console.log(ex)
    });

    callback(null, 'end');
}
