/***********************************************************
* Project: AppFolio Listing Search Tool
* File: search.js
* Date: 03.19.2018
* Author: Josh Bradley
* 
* @requires puppeteer
* @requires json2csv
* @requires js
************************************************************/

const puppeteer = require('puppeteer');
const Json2csvParser = require('json2csv').Parser;
const fs = require('fs');

const args = process.argv;
const search = args[2];
let subdomains = new Object();
let listingUrls = new Object();
let allListings = new Object();

getListings();


/**
* Collect data from listings and output to .csv
*
* @global args
* @global subdomains
* @global allListings
*/
async function getListings() {

  for (let i = 3; i <= (args.length - 1); i++) {
    const subdomain = args[i];
    const key = 'subdomain' + (i - 3);
    subdomains[key] = subdomain;
  }

  listingUrls = await scrapeSubdomains();
  console.log('Seaching for "' + search + '"');
  
  await searchListings();

  const fields = ['URL', 'Address', 'Rent', 'Size', 'Contact'];
  const json2csvParser = new Json2csvParser({ fields });

  if (objToArray(allListings).length) {

    const csv = json2csvParser.parse(objToArray(allListings));
    const filename = 'listings_' + Date.now() + '.csv';

    fs.writeFile('./' + filename, csv, function(e) {
      if (e) return console.log(e);
      console.log('Search complete: ' + filename + ' downloaded.');
    });

  } else {
    console.log('No listings found.')
  } // end if
}


/**
* Search through each subdomain
*
* @global subdomains
*/
async function scrapeSubdomains(){

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  console.log('Gathering listings...');

  try {

    const subdomainKeys = Object.keys(subdomains);
    let listings = new Object();

    for (const subdomain of subdomainKeys) {

      const listingPage = 'https://' + subdomains[subdomain] + '.appfolio.com/listings/';
      await page.goto(listingPage);

      listings[subdomains[subdomain]] = await page.evaluate((subdomains, subdomain) => {

        const html = document.all[0].outerHTML;
        const urls = html.match(/<a.*?>.*?View Details.*?<\/a>/gi);
        const urlObject = new Object();

        if (urls) {
          for (let i = 0; i < urls.length; i++) {
            const key = 'listing'  + i;
            let url = urls[i].match(/href="(.*?)"/i)[1];
            urlObject[key] = 'https://' +  subdomains[subdomain] + '.appfolio.com' + url;
          }
        }

        return urlObject;

      }, subdomains, subdomain); // end evaluate

    } // end for

    return listings;

  } catch(e) {
    console.log(e);
  } finally {
    await browser.close();
  }
}


/**
* Search each listing for the keyphrase, if there is a match, extract key data
*
* @global search
* @global listingUrls
*/
async function searchListings() {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {

    const allListingUrls = flattenObject(listingUrls);
    const listingKeys = Object.keys(allListingUrls);

    const total = listingKeys.length;

    let listingObject = new Object();
    let loopCount = 1;

    for (const listing of listingKeys) {

      await page.goto(allListingUrls[listing]);

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

        let listingInfo = await page.evaluate((allListingUrls, listing) => {

          const listingProperty = new Object();

          listingProperty['URL'] = allListingUrls[listing];
          listingProperty['Address'] = document.querySelector('h1').textContent;
          listingProperty['Rent'] = document.querySelector('.sidebar__price').textContent;
          listingProperty['Size'] = document.querySelector('.sidebar__beds-baths').textContent;
          listingProperty['Contact'] = document.querySelector('.u-pad-bl').textContent;

          return listingProperty;

        }, allListingUrls, listing); // end evaluate

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
* Convert a single dimensional object into an array of objects
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
* Remove HTML whitespace and unnecessary phrases
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
