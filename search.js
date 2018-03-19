const puppeteer = require('puppeteer');
const Json2csvParser = require('json2csv').Parser;
const fs = require('fs');

const search = process.argv[2];
let domains = new Object();
let listingUrls = new Object();
let allInfo = new Object();

searchDomains();

async function searchDomains() {
	for (let i = 3; i <= (process.argv.length - 1); i++) {
		const domain = process.argv[i];
		const key = 'domain' + (i - 3);
		domains[key] = domain;
	}
	listingUrls = await getListings();
	console.log('Seaching listings for "' + search + '".');
	await searchListings();
	const fields = ['URL', 'Address', 'Rent', 'Size', 'Contact'];
	const json2csvParser = new Json2csvParser({ fields });
	if (objToArray(allInfo).length) {
		const csv = json2csvParser.parse(objToArray(allInfo));
		fs.writeFile('./listings_' + Date.now() + '.csv', csv, function(e) {
			if(e) {
				return console.log(e);
			}
			console.log('File saved!');
		});
	} else {
		console.log('No listings found.')
	}
}

async function getListings(){
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	console.log('Gathering listings...');
	try {
		const domainKeys = Object.keys(domains);
		let listings = new Object();
		for (const domain of domainKeys) {
			const listingPage = 'https://' + domains[domain] + '.appfolio.com/listings/';
			await page.goto(listingPage);
			listings[domains[domain]] = await page.evaluate((domains, domain) => {
				const html = document.all[0].outerHTML;
				const urls = html.match(/<a.*?>.*?View Details.*?<\/a>/gi);
				const urlObj = new Object();
				if (urls) {
					for (let i = 0; i < urls.length; i++) {
						const key = 'listing'  + i;
						let url = urls[i].match(/href="(.*?)"/i)[1];
						urlObj[key] = 'https://' +  domains[domain] + '.appfolio.com' + url;
					}
				}
				return urlObj;
			}, domains, domain);
			console.log('Got listings from ' + domains[domain] + '.');
		}
		return listings;
	} catch(e) {
		console.log(e);
	} finally {
		await browser.close();
	}
}

async function searchListings() {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	try {
		const allListings = flattenObject(listingUrls);
		const listingKeys = Object.keys(allListings);
		const total = listingKeys.length;
		let listingObj = new Object();
		let loopCount = 1;
		for (const listing of listingKeys) {
			await page.goto(allListings[listing]);
			let results = await page.evaluate((search) => {
				const html = document.all[0].outerHTML;
				const matches = html.match(new RegExp(search, 'gi'));
				if (matches) {
					return true;
				} else {
					return false;
				}
			}, search);
			if (results) {
				let listingInfo = await page.evaluate((allListings, listing) => {
					const listingObj = new Object();
					listingObj['URL'] = allListings[listing];
					listingObj['Address'] = document.querySelector('h1').textContent;
					listingObj['Rent'] = document.querySelector('.sidebar__price').textContent;
					listingObj['Size'] = document.querySelector('.sidebar__beds-baths').textContent;
					listingObj['Contact'] = document.querySelector('.u-pad-bl').textContent;
					return listingObj;
				}, allListings, listing);
				listingObj[listing] = {};
				listingObj[listing] = cleanListing(listingInfo);
				allInfo = listingObj;
			}
			console.log(Math.floor((loopCount / total) * 100) + '% complete (Checked listing ' + loopCount + '/' + total + ')');
			loopCount++;
		}
	} catch(e) {
		console.log(e);
	} finally {
		await browser.close();
	}
}

function flattenObject(obj) {
	var toReturn = {};
	for (var i in obj) {
		if (!obj.hasOwnProperty(i)) continue;
		if ((typeof obj[i]) == 'object') {
			var flatObject = flattenObject(obj[i]);
			for (var x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;
				toReturn[i + '.' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = obj[i];
		}
	}
	return toReturn;
};

function cleanListing(listing) {
	const listingKeys = Object.keys(listing);
	for (const listingKey of listingKeys) {
		listing[listingKey] = listing[listingKey].replace(/\n/gi, ' ');
		listing[listingKey] = listing[listingKey].replace(/\s+/gi, ' ');
		listing[listingKey] = listing[listingKey].replace(/view\sall\slistings/gi, '');
		listing[listingKey] = listing[listingKey].replace(/MAP/g, '');
		listing[listingKey] = listing[listingKey].trim();
	}
	return listing;
}

function objToArray(obj) {
	var objArr = [];
	const keys = Object.keys(obj);
	for (const key of keys) {
		objArr.push(obj[key]);
	}
	return objArr;
}
