/***********************************************************
*
* Project: AppFolio Listing Search Tool
* File: search.js
* Date: 03.19.2018
* Author: Josh Bradley
*
* @requires puppeteer
* @requires json2csv
* @requires js
*
************************************************************/

const puppeteer = require('puppeteer');
const Json2csvParser = require('json2csv').Parser;
const fs = require('fs');

const args = process.argv;
const search = args[2];
let subDomains = new Object();
let listingUrls = new Object();
let allListings = new Object();

searchSubDomains(subDomains);


/**
* Collect data from listings and output to .csv
*
* @global args
* @global subDomains
* @global listingUrls
* @global allListings
*/
async function searchSubDomains() {

	for (let i = 3; i <= (args.length - 1); i++) {
		const subDomain = args[i];
		const key = 'subDomain' + (i - 3);
		subDomains[key] = subDomain;
	}

	listingUrls = await getListings();
	console.log('Seaching... "' + search + '"');
	
	await searchListings();

	const fields = ['URL', 'Address', 'Rent', 'Size', 'Contact'];
	const json2csvParser = new Json2csvParser({ fields });

	if (objToArray(allListings).length) {

		const csv = json2csvParser.parse(objToArray(allListings));

		fs.writeFile('./listings_' + Date.now() + '.csv', csv, function(e) {
			if (e) return console.log(e);
			console.log('File saved!');
		});

	} else {
		console.log('No listings found.')
	} // end if
}


/**
* Search through each subdomain
*
* @global subDomains
*/
async function getListings(){

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	console.log('Gathering listings...');

	try {

		const subDomainKeys = Object.keys(subDomains);
		let listings = new Object();

		for (const subDomain of subDomainKeys) {

			const listingPage = 'https://' + subDomains[subDomain] + '.appfolio.com/listings/';
			await page.goto(listingPage);

			listings[subDomains[subDomain]] = await page.evaluate((subDomains, subDomain) => {

				const html = document.all[0].outerHTML;
				const urls = html.match(/<a.*?>.*?View Details.*?<\/a>/gi);
				const urlObject = new Object();

				if (urls) {
					for (let i = 0; i < urls.length; i++) {
						const key = 'listing'  + i;
						let url = urls[i].match(/href="(.*?)"/i)[1];
						urlObject[key] = 'https://' +  subDomains[subDomain] + '.appfolio.com' + url;
					}
				}

				return urlObject;

			}, subDomains, subDomain); // end evaluate

		} // end for

		return listings;

	} catch(e) {
		console.log(e);
	} finally {
		await browser.close();
	}
}


/**
* Search each listing for the keyphrase, if there is a match, 
* extract key data
*
* @global search
* @global listungUrls
* @global allListings
*/
async function searchListings() {

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	try {

		const allListings = flattenObject(listingUrls);
		const listingKeys = Object.keys(allListings);

		const total = listingKeys.length;

		let listingObject = new Object();
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

			}, search); // end evaluate

			if (results) {

				let listingInfo = await page.evaluate((allListings, listing) => {

					const listingProperty = new Object();

					listingProperty['URL'] = allListings[listing];
					listingProperty['Address'] = document.querySelector('h1').textContent;
					listingProperty['Rent'] = document.querySelector('.sidebar__price').textContent;
					listingProperty['Size'] = document.querySelector('.sidebar__beds-baths').textContent;
					listingProperty['Contact'] = document.querySelector('.u-pad-bl').textContent;

					return listingProperty;

				}, allListings, listing); // end evaluate

				listingObject[listing] = {};
				listingObject[listing] = cleanListing(listingInfo);

				allListings = listingObject;

			} // end if

			console.log(Math.floor((loopCount / total) * 100) + '% complete (Checked listing ' + loopCount + '/' + total + ')');
			loopCount++;

		} // end for
	} catch(e) {
		console.log(e);
	} finally {
		await browser.close();
	}
}

/**
* Convert nested object into single dimensional key value pairs
*
* @param obj
*/
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
		} // end if
	} // end for

	return toReturn;

};


/**
* Convert a single dinmensinoal object into an array
*
* @param obj
*/
function objToArray(obj) {

	var objArr = [];
	const keys = Object.keys(obj);

	for (const key of keys) {
		objArr.push(obj[key]);
	}

	return objArr;

}


/**
* Pass listing information through regex filters
*
* @param listing
*/
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
