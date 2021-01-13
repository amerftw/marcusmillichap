const scraperObject = {
    //I assume its easier to have direct link to page then to have puppeteer click to this page
    url: 'https://www.marcusmillichap.com/properties?f-propertysubtypeid_Hospitality%2FGolf=Hotel-Motel&f-propertytype=Hospitality%2FGolf&pageNumber=1&stb=orderdate_dt,DESC',
    async scraper(browser) {
        let page = await browser.newPage();
        console.log('Navigating to marcusmillichap.com...');
        // Navigate to the selected page
        await page.goto(this.url);
        let scrapedData = [];
        // Wait for the required DOM to be rendered
        async function scrapeCurrentPage() {
            await page.waitForSelector('.results-content');
            // Get the link to all the properties
            let urls = await page.$$eval('.mm-gs-search-results > li > div', links => {
                // Extract the links from the data
                links = links.map(el => el.querySelector('a').href)
                return links;
            });
            // Loop through each of those links, open a new page instance and get the relevant data from them
            let pagePromise = (link) => new Promise(async (resolve, reject) => {
                let dataObj = {};
                let newPage = await browser.newPage();
                await newPage.goto(link);
                dataObj['adress'] = await newPage.$eval('.score-hero-body > p', text => text.innerText);
                let size = await newPage.$eval('.mm-property-specifications > div > div:nth-child(3) > div.specification-value', divs => divs.innerText);
                if (size.indexOf(',') === -1) {
                    dataObj['size'] = '';
                } else {
                    dataObj['size'] = size
                }
                dataObj['price'] = await newPage.$eval('.mm-property-specifications > h4', text => text.textContent);
                //let brokerElement = 
                let broker = await newPage.$$eval('.mm-property-detail-desktop .mm-advisor-list > li', list => {
                    let nameElement = list.map(nm => nm.querySelector('div > h3') ? nm.querySelector('div > h3').textContent : '');
                    let telephoneElement = list.map(tel => tel.querySelector('.ipa-phone > a') ? tel.querySelector('.ipa-phone > a').text : '');
                    let emailElement = list.map(em => em.querySelector('.ipa-email > a') ? em.querySelector('.ipa-email > a').href.split(':').pop() : '');

                    return nameElement + ',' + telephoneElement + ',' + emailElement;
                });
                dataObj['broker'] = broker;
                resolve(dataObj);
                await newPage.close();
            });  
            for (link in urls) {
                    let currentPageData = await pagePromise(urls[link]);
                    scrapedData.push(currentPageData);
                    console.log(currentPageData);
                }
                // When all the data on this page is done, click the next button and start the scraping of the next page
                // You are going to check if this button exist first, so you know if there really is a next page.

                let nextButtonExist = false;
                await page.waitForTimeout(3000);
                try {
                    const nextButton = await page.$eval('.next > a', a => a.href);
                    nextButtonExist = true;
                } catch (err) {
                    nextButtonExist = false;
                }
                if (nextButtonExist) {
                    await page.click('.next > a');
                    return scrapeCurrentPage(); // Call this function recursively
                }
              
            await page.close();
            return scrapedData;
        }
        
        let data = await scrapeCurrentPage();
        console.log(data);
        return data;
    }
}
module.exports = scraperObject;