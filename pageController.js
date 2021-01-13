const pageScraper = require('./scraper.js');
const fs = require('fs');

async function scrapeAll(browserInstance) {
    let browser;
    try {
        browser = await browserInstance;
        scrapedData = await pageScraper.scraper(browser);
        // You can comment out close call if you dont want browser to close
        // Also you can terminate browser then and it will save data that it scapted up to that point.
        await browser.close();
        // It needs to be changed
        fs.writeFile("data.json", JSON.stringify(scrapedData), 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The data has been scraped and saved successfully! View it at 'data.json'");
        });

    } catch (err) {
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)