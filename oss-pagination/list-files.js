'use strict';
/*
    Alibaba Cloud: List objects in an OSS
*/

const OSS = require('ali-oss');

const oss_region = 'oss-cn-shanghai';
const bucket_name = '<yourBucketName>';
const object_prefix = '';
const accessKeyId = '<yourAccessKeyId>';
const accessKeySecret = '<yourAccessKeySecret>';

const store = new OSS({
    region: oss_region,
    internal: false,
    secure: true,
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    bucket: bucket_name
});

async function listFiles1() {
    const result = await store.list();
    console.log(result);
}

//listFiles1();

async function listFiles2() {

    let truncated = false;
    let nextMarker = '';

    do {
        const objectsRequest = {
            Marker: nextMarker,
            Prefix: object_prefix,
            MaxKeys: 100
        };

        console.log(objectsRequest);
        const result = await store.list(objectsRequest);
        console.log(result.nextMarker);
        console.log('************************************');

        truncated = result.isTruncated;
        nextMarker = result.nextMarker;
    } while (truncated === true)
}

listFiles2();


