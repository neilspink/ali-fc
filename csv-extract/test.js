'use strict';
/*
    Alibaba Cloud: Code used to develop function compute program on locally.

    npm install fs
    npm install ali-oss
    npm install stream
    npm install string_decoder

    The npm modules could have been put in a package but I omitted this for simplicity.
*/

const OSS = require('ali-oss');
const fs = require('fs');
const {pipeline, Transform} = require('stream');
const {StringDecoder} = require('string_decoder');

const oss_region = 'oss-cn-shanghai';
var bucket_name = 'csv-processing';
var object_name = 'Test-Data.csv';

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

        var result = [];

        //process CSV data
        if (chunk.includes(',')) {

            //each line is a row of data
            var data = chunk.split(/\r?\n/);

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

let store = new OSS({
    region: oss_region,
    internal: false,
    secure: true,
    accessKeyId: 'super-secret',
    accessKeySecret: 'super-secret',
    bucket: bucket_name
});

async function listBuckets() {
    try {
        let result = await store.listBuckets();
        console.log("Bucket");
        console.log(result);

    } catch (err) {
        console.log(err);
    }
}

//listBuckets();

async function useAliOSS() {
    try {
        let csvData = await store.getStream(object_name);

        const transformer = new ParseCsv();

        await store.putStream(output_filename, csvData.stream.pipe(transformer)).then((result) => {
            console.log('parse completed');
        });

    } catch (err) {
        console.log(err);
    }
}

//getCsv();

async function useLocalDisk() {
    try {
        const transformer = new ParseCsv();

        await pipeline(
            fs.createReadStream('./Test-Data.csv'),
            transformer,
            fs.createWriteStream('./dataOutput.txt')
        );

        console.log('parse completed');

    } catch (err) {
        console.log(err);
    }
}

useLocalDisk();