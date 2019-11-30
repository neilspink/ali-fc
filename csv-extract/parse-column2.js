'use strict';
/*
    Alibaba Cloud: Function to parse CSV for column 2 and save to text file.
*/

const OSS = require('ali-oss').Wrapper;
const { Transform } = require('stream');
const {StringDecoder} = require('string_decoder');

class ParseCsv extends Transform {
    constructor(options) {
        super(options);

        // The stream will have Buffer chunks. The
        // decoder converts these to String instances.
        this._decoder = new StringDecoder('utf-8')
    }

    _transform(chunk, encoding, callback) {
        // Convert the Buffer chunks to String.
        if (encoding === 'buffer') {
            chunk = this._decoder.write(chunk);
        }

        let result = [];

        //process CSV data
        if (chunk.includes(',')) {

            //each line is a row of data
            let data = chunk.split(/\r?\n/);

            //take second column data
            data.forEach(item => {
                let slice = item.split(',');
                result.push(slice[1]);
            });
        }

        //convert array to list
        result = result.toString().split(',').join("\n");

        // Pass the chunk on.
        callback(null, result)
    }
}

module.exports.handler = async function(event, context, callback) {

    console.log('running...');

    //function is triggered by an event, get the object.
    const evt_lst = JSON.parse(event);
    const evt = evt_lst.events[0];

    const oss_region = 'oss-' + evt.region;
    const bucket_name = evt.oss.bucket.name;
    const object_name = evt.oss.object.key;

    //remove folder prefix and change file extension
    const output_filename = object_name.replace(/^^[^\/]*\//, "").replace(/\.[^/.]+$/, ".txt");

    //logging key information for debug
    console.log('oss_region: ' + oss_region);
    console.log('bucket_name: ' + bucket_name + ' object_name: ' + object_name);
    console.log('output_filename: ' + output_filename);
    console.log('******');

    try {

        let store = new OSS({
            region: oss_region,
            internal: true,
            secure: true,
            accessKeyId: context.credentials.accessKeyId,
            accessKeySecret: context.credentials.accessKeySecret,
            stsToken: context.credentials.securityToken,
            bucket: bucket_name
        });

        let csvData = await store.getStream(object_name);

        const transformer = new ParseCsv();

        await store.putStream(output_filename, csvData.stream.pipe(transformer)).then((result) => {
            console.log('parse completed');
        });

        callback(null, 'done');

    } catch (err) {
        callback(err, 'failed');
    }
};