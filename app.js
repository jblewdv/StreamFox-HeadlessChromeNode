/*

Date: 12/2/2019
Author: Joshua Blew

*/

'use strict';

const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const request = require('request');

require('dotenv/config');

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/getCookies', async function(req, res, next) {
    var creds;
    // local
    // request.get("http://localhost:3000/users/fetch?service=" + req.query.service, function(error, response, body) { 
    //     creds = JSON.parse(body);
    // });
    // production
    request.get("https://streamfox-web.herokuapp.com/users/fetch?service=" + req.query.service, function(error, response, body) { 
        creds = JSON.parse(body);
    });

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    // const browser = await puppeteer.launch();
    const page = await browser.newPage();

    if (creds['type'] === 'netflix') {
        console.log("Starting Netflix session");
        await page.goto('https://www.netflix.com/login', {
            timeout: 60000
        });
        await page.type('#id_userLoginId', creds['email']);
        await page.type('#id_password', creds['password']);
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
  
        var cookies = await page.cookies();
        // await page.goto('https://www.netflix.com/SignOut?lnkctr=mL');
        res.send({ data: cookies });
    }

    if (creds['type'] === 'hulu') {
        console.log("Starting Hulu session");
        await page.goto('https://www.hulu.com/login',  {
            timeout: 60000
        });
        await page.type('#email_id', creds['email']);
        await page.type('#password_id', creds['password']);
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('login-button');
            let enter = buttons[1];
            enter.click();
        });
        await page.waitForNavigation();
        
        var cookies = await page.cookies();
        res.send({ data: cookies });
       
    }
    
    // ! needs validation url check !
    if (creds['type'] === 'cbs') {
        console.log("Starting CBS session");
        await page.goto('https://www.cbs.com/cbs-all-access/signin/');
        await page.waitForSelector('.qt-emailtxtfield');
        await page.type('.qt-emailtxtfield', creds['email']);
        await page.type('.qt-passwordtxtfield', creds['password']);
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('button');
            let enter = buttons[0];
            enter.click();
        });
        await page.waitForNavigation();
        
        var cookies = await page.cookies();
        res.send({ data: cookies });
    }

    if (creds['type'] === 'showtime') {
        console.log("Starting Showtime session");
        await page.goto('https://www.showtime.com/#signin', {
            timeout: 60000
        });
        await page.waitForSelector('#email');
        await page.type('#email', creds['email']);
        await page.type('#password', creds['password']);
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName('button');
            let enter = buttons[0];
            enter.click();
        });
        await page.waitForNavigation();
       
        var cookies = await page.cookies();
        res.send({ data: cookies });
    }

    await browser.close();
});

/* APP - GET route */
app.get('/', async function(req, res) {

    const SERVICE = req.query.service;
    const EMAIL = req.query.email;
    const PASSWORD = req.query.password;
    // const SERVICE = req.body.service;
    // const EMAIL = req.body.email;
    // const PASSWORD = req.body.password;
  

    // const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const browser = await puppeteer.launch();
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
        if (getCookies === true) {
            var cookies = await page.cookies();
            res.send({ data: cookies });
        } else {
            if (page.url() === 'https://www.netflix.com/browse') {
                res.send({ type: SERVICE, validation: true });
            }
            else {
                res.send({ type: SERVICE, validation: false });
            }
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

        if (getCookies === 'true') {
            var cookies = await page.cookies();
            res.send({ data: cookies });
        } else {
            if (page.url() === 'https://www.hulu.com/profiles?next=/') {
                res.send({ type: SERVICE, validation: true });
            }
            else {
                res.send({ type: SERVICE, validation: false });
            }
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
        
        if (getCookies === true) {
            var cookies = await page.cookies();
            res.send({ data: cookies });
        } else {
            if (page.url() === 'https://www.cbs.com/#') {
                res.send({ type: SERVICE, validation: true });
            }
            else {
                res.send({ type: SERVICE, validation: false });
            }
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
       
        if (getCookies === true) {
            var cookies = await page.cookies();
            res.send({ data: cookies });
        } else {
            if (page.url() === 'https://www.showtime.com/#') {
                res.send({ type: SERVICE, validation: true });
            }
            else {
                res.send({ type: SERVICE, validation: false });
            }
        }
    }

    await browser.close();
});


app.listen(process.env.PORT || 5000, function(){
    console.log("Chrome server listening on port %d in %s mode", this.address().port, app.settings.env);
});