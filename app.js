const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
require('dotenv/config');

const app = express()

app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(req, res) {
    res.send({ status: 200, message: "hello"} );
});

/* APP - GET route */
app.get('/validate', async function(req, res) {
    // const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const browser = await puppeteer.launch({
        headless: true,
        executablePath:'/node_modules/puppeteer/.local-chromium/linux-706915/chrome-linux/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const PLATFORM = req.query.platform;
    const USERNAME = req.query.username;
    const PASSWORD = req.query.password;

    /*
    var loginLink = process.env[PLATFORM + '_LOGIN_URI'];
    var usernameDiv = process.env[PLATFORM + '_USERNAME_DIV'];
    var passwordDiv = process.env[PLATFORM + '_PASSWORD_DIV'];
    var submitPath = process.env[PLATFORM + '_SUBMIT_PATH'];
    var submitIndex = process.env[PLATFORM + "_SUBMIT_INDEX"];
    var successType = process.env[PLATFORM + 'SUCCUSS_TYPE'];
    var successValue = process.env[PLATFORM + 'SUCCESS_VALUE'];
    */

    const page = await browser.newPage();

    if (PLATFORM === 'netflix') {
        await page.goto('https://www.netflix.com/login');
        await page.type('#id_userLoginId', USERNAME);
        await page.type('#id_password', PASSWORD);
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('login-button');
            let submit = buttons[0];
            
            submit.click();
        });
        await page.waitForNavigation();
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('profile-icon');
            let enter = buttons[0];  
            enter.click();
        });
        if (page.url() === 'https://www.netflix.com/browse') {
            res.send({ type: PLATFORM, validation: true });
        }
        else {
            res.send({ type: PLATFORM, validation: false });
        }
    }

    if (PLATFORM === 'hulu') {
        await page.goto('https://www.hulu.com/login');
        await page.type('#email_id', USERNAME);
        await page.type('#password_id', PASSWORD);
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('login-button');
            let enter = buttons[1];
            enter.click();
        });
        await page.waitForNavigation();
        if (page.url() === 'https://www.hulu.com/profiles?next=/') {
            res.send({ type: PLATFORM, validation: true });
        }
        else {
            res.send({ type: PLATFORM, validation: false });
        }
    }
    
    // ! needs validation url check !
    if (PLATFORM === 'cbs') {
        await page.goto('https://www.cbs.com/cbs-all-access/signin/');
        await page.waitForSelector('.qt-emailtxtfield');
        await page.type('.qt-emailtxtfield', USERNAME);
        await page.type('.qt-passwordtxtfield', PASSWORD);
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('button');
            let enter = buttons[0];
            enter.click();
        });
        await page.waitForNavigation();
        if (page.url() === 'https://www.showtime.com/#') {
            res.send({ type: PLATFORM, validation: true });
        }
        else {
            res.send({ type: PLATFORM, validation: false });
        }
    }

    if (PLATFORM === 'showtime') {
        await page.goto('https://www.showtime.com/#signin');
        await page.waitForSelector('#email');
        await page.type('#email', USERNAME);
        await page.type('#password', PASSWORD);
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('button');
            let enter = buttons[0];
            enter.click();
        });
        await page.waitForNavigation();
        if (page.url() === 'https://www.showtime.com/#') {
            res.send({ type: PLATFORM, validation: true });
        }
        else {
            res.send({ type: PLATFORM, validation: false });
        }

    }

    await browser.close();
});


app.listen(process.env.PORT || 5000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});



// app.listen(5000, function () {
//   console.log('Chrome API listening on port 5000!')
// });