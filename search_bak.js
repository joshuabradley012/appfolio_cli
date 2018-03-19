const puppeteer = require('puppeteer');
let allInfo = new Object();
checkDomains();

async function checkDomains() {
	for (let i = 2; i <= (process.argv.length - 1); i++) {
		let domain = process.argv[i];
		await getSection8(domain);
	}
	console.log(allInfo);
}

async function getSection8(domain){
	try {
		const listingPage = 'https://' + domain + '.appfolio.com/listings/';
		const listingUrls = await getListings(listingPage, domain);
		await checkSection8(listingUrls, domain);
	} catch(e) {
		console.log(e);
	} finally {
		return;
	}
}

async function getListings(listingPage, domain){
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(listingPage);
	try {
		const listings = await page.evaluate(async(domain) => {
			const html = document.all[0].outerHTML;
			const urls = html.match(/<a.*?>.*?View Details.*?<\/a>/gi);
			const urlObj = new Object();
			if (urls) {
				for (let i = 0; i < urls.length; i++) {
					const key = 'listing' + i;
					let url = urls[i].match(/href="(.*?)"/i)[1];
					urlObj[key] = 'https://' +  domain + '.appfolio.com' + url;
				}
			}
			return urlObj;
		}, domain);
		return listings;
	} catch(e) {
		console.log(e);
	} finally {
		await browser.close();
	}
}

async function checkSection8(listingUrls, domain) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	try {
		const listings = Object.keys(listingUrls);
		const total = listings.length;
		let section8Info = new Object();
		let loopCount = 1;
		for (const listing of listings) {
			await page.goto(listingUrls[listing]);
			let isSection8 = await page.evaluate(async() => {
				const html = document.all[0].outerHTML;
				const isSection8 = html.match(/section\s*(?:8|eight)/gi);
				if (hasSection8) {
					return true;
				} else {
					return false;
				}
			});
			if (isSection8) {
				let listingInfo = await page.evaluate((listingUrls, listing) => {
					const listingObj = new Object();
					listingObj['URL'] = listingUrls[listing];
					listingObj['Address'] = document.querySelector('h1').textContent;
					listingObj['Rent'] = document.querySelector('.sidebar__price').textContent;
					listingObj['Size'] = document.querySelector('.sidebar__beds-baths').textContent;
					listingObj['Contact'] = document.querySelector('.u-pad-bl').textContent;
					return listingObj;
				}, listingUrls, listing);
				section8Info[listing] = {};
				section8Info[listing] = listingInfo;
				allInfo[domain] = section8Info;
			}
			console.log(Math.floor((loopCount / total) * 100) + '% complete with ' + domain + ' (' + loopCount + '/' + total + ' listings)');
			loopCount++;
		}
	} catch(e) {
		console.log(e);
	} finally {
		await browser.close();
	}
}
