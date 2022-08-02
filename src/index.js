const robo = require('puppeteer');
const express = require('express');
const dotenv = require('dotenv');


dotenv.config() // environment vars
const app = express();
const port = process.env.PORT || 80;

app.get('/stats/:region/:player', async (req, res) => {

    const region = req.params.region;
    const player = req.params.player; // player name
    const final_url = `https://www.leagueofgraphs.com/summoner/${region}/${player}`;
    
    const browser = await robo.launch({ args: ['--no-sandbox'] }); // browser instance
    const page = await browser.newPage(); // new page

    // useragent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');;
    
    await page.goto(final_url); // setting url
    page.setDefaultNavigationTimeout(0); // timeout config
    //aguarde nossos dados antes de continuar
    await page.waitForSelector("#mainContent"); // wait this element

    const err = await page.evaluate(() => { // checking if not found
        const el = document.querySelector("#mainContent div div");
        return el.textContent.trim();
    });
    
    if(err.startsWith("Not Found")) {
        res.status(404).send("Not Found");
        return;
    }

    const cap = await page.evaluate(() => { // selecting attr
        const arr = Array.from(document.querySelectorAll("#mainContent div.row div.medium-13.small-24.columns div.box.tags-box div"));
        let converted = [];

        arr.map((el) => { // mapping elements
            converted.push(el.textContent.trim()); // getting text
        });
        return converted;
    });
    
    res.status(200).send({stats: cap}); // sending response
    page.close(); 
});

app.listen(port, () => {
    console.log("SERVER LISTENING ON " + port);
});