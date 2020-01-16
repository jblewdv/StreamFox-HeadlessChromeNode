

/* Copyright (C) StreamFox, LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Joshua Blew <jblew.business@gmail.com>, December 2019
*/


// Modules
const request = require('request');
const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

require('dotenv/config'); // Config vars

const app = express();

app.use(bodyParser.urlencoded({ 
    extended: true 
}));

/*
    --- ROUTES ---
*/


/*
    Server status check
*/
app.get('/status', function(req, res, next) {
    res.status(200);
});


/*
    Cookie Retrieval for Login 
*/
app.get('/getCookies', async function(req, res, next) {
    request.get("https://streamfox-web.herokuapp.com/users/fetch?type=" + req.query.service, async function(error, response, body) { 
        
        // Fetch a service for the user
        var service = JSON.parse(body).service;

        // Setup puppeteer.js
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();

        if (service.type === 'netflix') {        
            try {
                // Navigate to Netflix login page and insert login credentials
                await page.goto("https://www.netflix.com/login");
                await page.type("#id_userLoginId", service.email);
                await page.type("#id_password", service.password);
                await page.evaluate(() => {
                    let buttons = document.getElementsByClassName("login-button");
                    let submit = buttons[0];
                    submit.click();
                });
                await page.waitForNavigation();
                
                // Select a Netflix profile
                await page.evaluate(() => {
                    let buttons = document.getElementsByClassName("profile-icon");
                    let enter = buttons[0];  
                    enter.click();
                });
        
                // Grab Netflix cookies and return
                var cookies = await page.cookies();
                res.send({ 
                    cookies: cookies,
                    service: service 
                });
            } catch(err) {
                res.send({ 
                    cookies: null,
                    service: service,
                    error: err 
                });
            } 
        }

        if (service.type === 'hulu') {        
            try {
                // Navigate to Hulu login page and insert login credentials
                await page.goto("https://www.hulu.com/login");
                await page.type("#email_id", service.email);
                await page.type("#password_id", service.password);
                await page.evaluate(() => {
                    let buttons = document.getElementsByClassName("login-button");
                    let enter = buttons[1];
                    enter.click();
                });
                await page.waitForNavigation();
                
                // Grab Netflix cookies and return
                var cookies = await page.cookies();
                res.send({ 
                    cookies: cookies,
                    service: service 
                });
            } catch (err) {
                res.send({ 
                    cookies: null,
                    service: service,
                    error: err
                });
            }
        }
    
        if (service.type === 'cbs') {
            try {
                // Navigate to CBS login page and insert login credentials
                await page.goto(CBS_LOGIN_URI);
                await page.waitForSelector(CBS_USERNAME_DIV);
                await page.type(CBS_USERNAME_DIV, service.email);
                await page.type(CBS_PASSWORD_DIV, service.password);
                await page.evaluate(() => {
                    let buttons = document.getElementsByClassName(CBS_SUBMIT_PATH);
                    let enter = buttons[CBS_SUBMIT_INDEX];
                    enter.click();
                });
                await page.waitForNavigation();
                
                // Grab CBS cookies and return
                var cookies = await page.cookies();
                res.send({ 
                    cookies: cookies,
                    service: service 
                });
            } catch (err) {
                res.send({ 
                    cookies: null,
                    service: service,
                    error: err
                });
            } 
        }

        if (service.type === 'showtime') {
            try {
                // Navigate to Showtime login page and insert login credentials
                await page.goto("https://www.showtime.com/#signin");
                await page.waitForSelector("#email");
                await page.type("#email", service.email);
                await page.type("#password", service.password);
                await page.evaluate(() => {
                    let buttons = document.getElementsByClassName("button");
                    let enter = buttons[0];
                    enter.click();
                });
                await page.waitForNavigation();
            
                // Grab Showtime cookies and return
                var cookies = await page.cookies();
                res.send({ 
                    cookies: cookies,
                    service: service 
                });
            } catch (err) {
                res.send({ 
                    cookies: null,
                    service: service,
                    error: err
                });
            }
        }

        // Close puppeteer.js browser
        await browser.close();     
    });
});


/*
    Test if credentials are valid
*/
app.get('/checkValid', async function(req, res, next) {
    
    // Setup puppeteer.js
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    if (req.query.service === 'netflix') {
        try {
            // Navigate to Netflix login page and insert login credentials
            await page.goto("https://www.netflix.com/login");
            await page.type("#id_userLoginId", req.query.email);
            await page.type("#id_password", req.query.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("login-button");
                let submit = buttons[0];
                submit.click();
            });
            await page.waitForNavigation();

            // Select a Netflix profile
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("profile-icon");
                let enter = buttons[0];  
                enter.click();
            });
            
            // Check if login succeeded
            if (page.url() === "https://www.netflix.com/browse") { // TODO: update res.send data
                res.send({ 
                    type: req.query.service, 
                    validation: true 
                });
            } else {
                res.send({ 
                    type: req.query.service, 
                    validation: false 
                });
            }
        } catch (err) {
            res.send({ 
                type: req.query.service, 
                error: err 
            });
        }  
    }

    if (req.query.service === 'hulu') {
        try {
            // Navigate to Hulu login page and insert login credentials
            await page.goto("https://www.hulu.com/login");
            await page.type("#email_id", req.query.email);
            await page.type("#password_id", req.query.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("login-button");
                let enter = buttons[1];
                enter.click();
            });
            await page.waitForNavigation();

            // Check if login succeeded
            if (page.url() === "https://www.hulu.com/profiles?next=/") { // TODO
                res.send({ 
                    type: req.query.service, 
                    validation: true 
                });
            } else {
                res.send({ 
                    type: req.query.service, 
                    validation: false 
                });
            }
        } catch (err) {
            res.send({ 
                type: req.query.service, 
                error: err 
            });
        }
    }
    
    // ! needs validation url check !
    if (req.query.service === 'cbs') {
        try {
            // Navigate to CBS login page and insert login credentials
            await page.goto(CBS_LOGIN_URI);
            await page.waitForSelector(CBS_USERNAME_DIV);
            await page.type(CBS_USERNAME_DIV, req.query.email);
            await page.type(CBS_PASSWORD_DIV, req.query.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName(CBS_SUBMIT_PATH);
                let enter = buttons[CBS_SUBMIT_INDEX];
                enter.click();
            });
            await page.waitForNavigation();
            
            // Check if login succeeded
            if (page.url() === CBS_SUCCESS_VALUE) { // TODO
                res.send({ 
                    type: req.query.service, 
                    validation: true 
                });
            } else {
                res.send({ 
                    type: req.query.service, 
                    validation: false 
                });
            }
        } catch (err) {
            res.send({ 
                type: req.query.service, 
                error: err 
            });
        }  
    }

    if (req.query.service === 'showtime') {
        try {
            // Navigate to Showtime login page and insert login credentials
            await page.goto("https://www.showtime.com/#signin");
            await page.waitForSelector("#email");
            await page.type("#email", req.query.email);
            await page.type("#password", req.query.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("button");
                let enter = buttons[0];
                enter.click();
            });
            await page.waitForNavigation();
        
            // Check if login succeeded
            if (page.url() === "https://www.showtime.com/#") { // TODO
                res.send({ 
                    type: req.query.service, 
                    validation: true 
                });
            } else {
                res.send({ 
                    type: req.query.service, 
                    validation: false 
                });
            }
        } catch (err) {
            res.send({ 
                type: req.query.service,
                error: err 
            });
        }
    }

     // Close puppeteer.js browser
    await browser.close();
});



/* 
    Start server
*/
app.listen(process.env.PORT || 5000, function(){
    console.log("Chrome server listening on port %d in %s mode", this.address().port, app.settings.env);
});