'use strict';
const path = require('path');
const fs = require('fs');
const https = require('https');
const alfy = require('alfy');
const parseString = require('xml2js').parseString;

let media = path.join(__dirname, 'media');

function ensureDirectoryExistence(filePath) {
	var dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
	  return true;
	}
	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}


function download(filename, url, callback) {
	ensureDirectoryExistence(filename)
	let file = fs.createWriteStream(filename);

	https.get(url, function (response) {
		if (callback !== undefined) {
			response.pipe(file).on('finish', () => {
				callback(file);
			});
		}
	});
}

function parseXml(xml) {
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

(async () => {
	const xml = await alfy.fetch(alfy.input, {json: false});
    let data = await parseXml(xml);
    let result = data.rss.channel[0];
    
    const basedFeed = Buffer.from(alfy.input).toString('base64').replace('/', '_').replace('+', '-');
    const iconPath = path.join(media, `${basedFeed}.jpg`);

    fs.exists(iconPath, exists => {
        if (!exists) {
            download(iconPath, result['itunes:image'][0].$.href, () => {
                return true;
            });
        }
    });

	alfy.output([{
        title: result.title[0],
        subtitle: `Open in Steno.fm ✏️`,
        arg: `${basedFeed},${alfy.input}`,
        icon: {
            path: iconPath
        }
    }]);
})();
