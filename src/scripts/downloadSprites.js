const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const url = require('url');

const downloadImage = async (imageUrl, filepath) => {
	const writer = fs.createWriteStream(filepath);

	const response = await axios({
		url: imageUrl,
		method: 'GET',
		responseType: 'stream',
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
		},
	});

	response.data.pipe(writer);

	return new Promise((resolve, reject) => {
		writer.on('finish', resolve);
		writer.on('error', reject);
	});
};

const downloadImagesFromWiki = async (wikiUrl) => {
	try {
		const response = await axios.get(wikiUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
			},
		});
		const html = response.data;
		const $ = cheerio.load(html);
		const imageUrls = [];

		$('img').each((index, element) => {
			let src = $(element).attr('src');
			if (src) {
				if (src.startsWith('//')) {
					src = 'https:' + src;
				}
				else if (!src.startsWith('http')) {
					const baseUrl = url.resolve(wikiUrl, src);
					src = baseUrl;
				}
				imageUrls.push(src);
			}
		});

		if (!fs.existsSync('images')) {
			fs.mkdirSync('images');
		}

		for (const imageUrl of imageUrls) {
			const filename = path.basename(url.parse(imageUrl).pathname);
			const filepath = path.join('images', filename);
			await downloadImage(imageUrl, filepath);
			console.log(`Downloaded ${filename}`);
		}

		console.log('All images have been downloaded.');
	}
	catch (error) {
		console.error('Error downloading images:', error);
	}
};

const wikiUrl = 'https://stardewcommunitywiki.com/Modding:Object_data/Sprites';
downloadImagesFromWiki(wikiUrl);