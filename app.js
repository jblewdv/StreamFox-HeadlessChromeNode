/*

Date: 12/2/2019
Author: Joshua Blew

*/

'use strict';

const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

require('dotenv/config');
const app = express()
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/test', async function(req, res, next) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    if ('hulu' === 'hulu') {
        await page.goto('https://www.hulu.com/login');
        await page.type('#email_id', 'joshua.blewj@gmail.com');
        await page.type('#password_id', 'Isuckatdota2');
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('login-button');
            let enter = buttons[1];
            enter.click();
        });
        await page.waitForNavigation();
        var cookies = await page.cookies();
        res.send({data: cookies});
        // if (page.url() === 'https://www.hulu.com/profiles?next=/') {
        //     res.send({ type: PLATFORM, validation: true });
        // }
        // else {
        //     res.send({ type: PLATFORM, validation: false });
        // }
    }
    await browser.close();
})

/* APP - GET route */
app.get('/', async function(req, res) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    
    const SERVICE = req.body.service;
    const EMAIL = req.body.email;
    const PASSWORD = req.body.password;

    const page = await browser.newPage();

    if (SERVICE === 'netflix') {
        await page.goto('https://www.netflix.com/login');
        await page.type('#id_userLoginId', EMAIL);
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
            res.send({ type: SERVICE, validation: true });
        }
        else {
            res.send({ type: SERVICE, validation: false });
        }
    }

    if (SERVICE === 'hulu') {
        await page.goto('https://www.hulu.com/login');
        await page.type('#email_id', EMAIL);
        await page.type('#password_id', PASSWORD);
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('login-button');
            let enter = buttons[1];
            enter.click();
        });
        await page.waitForNavigation();
        if (page.url() === 'https://www.hulu.com/profiles?next=/') {
            res.send({ type: SERVICE, validation: true });
        }
        else {
            res.send({ type: SERVICE, validation: false });
        }
    }
    
    // ! needs validation url check !
    if (SERVICE === 'cbs') {
        await page.goto('https://www.cbs.com/cbs-all-access/signin/');
        await page.waitForSelector('.qt-emailtxtfield');
        await page.type('.qt-emailtxtfield', EMAIL);
        await page.type('.qt-passwordtxtfield', PASSWORD);
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('button');
            let enter = buttons[0];
            enter.click();
        });
        await page.waitForNavigation();
        if (page.url() === 'https://www.showtime.com/#') {
            res.send({ type: SERVICE, validation: true });
        }
        else {
            res.send({ type: SERVICE, validation: false });
        }
    }

    if (SERVICE === 'showtime') {
        await page.goto('https://www.showtime.com/#signin');
        await page.waitForSelector('#email');
        await page.type('#email', EMAIL);
        await page.type('#password', PASSWORD);
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('button');
            let enter = buttons[0];
            enter.click();
        });
        await page.waitForNavigation();
        if (page.url() === 'https://www.showtime.com/#') {
            res.send({ type: SERVICE, validation: true });
        }
        else {
            res.send({ type: SERVICE, validation: false });
        }

    }

    await browser.close();
});


app.listen(process.env.PORT || 5000, function(){
    console.log("Chrome server listening on port %d in %s mode", this.address().port, app.settings.env);
});