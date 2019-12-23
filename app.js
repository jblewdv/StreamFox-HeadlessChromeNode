

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
    Cookie Retrieval for Login 
*/
app.get('/getCookies', async function(req, res, next) {
    request.get(process.env.FETCH_URL + "?type=" + req.query.service, async function(error, response, body) { 
        
        // Fetch a service for the user
        var service = JSON.parse(body).service;

        // Setup puppeteer.js
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();

        if (service.type === 'netflix') {        
            try {
                // Navigate to Netflix login page and insert login credentials
                await page.goto(process.env.NETFLIX_LOGIN_URI);
                await page.type(process.env.NETFLIX_USERNAME_DIV, service.email);
                await page.type(process.env.NETFLIX_PASSWORD_DIV, service.password);
                await page.evaluate(() => {
                    let buttons = document.getElementsByClassName(process.env.NETFLIX_SUBMIT_PATH);
                    let submit = buttons[process.env.NETFLIX_SUBMIT_INDEX];
                    submit.click();
                });
                await page.waitForNavigation();
                
                // Select a Netflix profile
                await page.evaluate(() => {
                    let buttons = document.getElementsByClassName(process.env.NETFLIX_SUBMIT_PATH_AUX);
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
                await page.goto(process.env.HULU_LOGIN_URI);
                await page.type(process.env.HULU_USERNAME_DIV, service.email);
                await page.type(process.env.HULU_PASSWORD_DIV, service.password);
                await page.evaluate(() => {
                    let buttons = document.getElementsByClassName(process.env.HULU_SUBMIT_PATH);
                    let enter = buttons[process.env.HULU_SUBMIT_INDEX];
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
                await page.goto(process.env.CBS_LOGIN_URI);
                await page.waitForSelector(process.env.CBS_USERNAME_DIV);
                await page.type(process.env.CBS_USERNAME_DIV, service.email);
                await page.type(process.env.CBS_PASSWORD_DIV, service.password);
                await page.evaluate(() => {
                    let buttons = document.getElementsByClassName(process.env.CBS_SUBMIT_PATH);
                    let enter = buttons[process.env.CBS_SUBMIT_INDEX];
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
                await page.goto(process.env.SHOWTIME_LOGIN_URI);
                await page.waitForSelector(process.env.SHOWTIME_USERNAME_DIV);
                await page.type(process.env.SHOWTIME_USERNAME_DIV, service.email);
                await page.type(process.env.SHOWTIME_PASSWORD_DIV, service.password);
                await page.evaluate(() => {
                    let buttons = document.getElementsByClassName(process.env.SHOWTIME_SUBMIT_PATH);
                    let enter = buttons[process.env.SHOWTIME_SUBMIT_INDEX];
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
            await page.goto(process.env.NETFLIX_LOGIN_URI);
            await page.type(process.env.NETFLIX_EMAIL_DIV, req.query.email);
            await page.type(process.env.NETFLIX_PASSWORD_DIV, req.query.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName(process.env.NETFLIX_SUBMIT_PATH);
                let submit = buttons[process.env.NETFLIX_SUBMIT_INDEX];
                submit.click();
            });
            await page.waitForNavigation();

            // Select a Netflix profile
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName(process.env.NETFLIX_SUBMIT_PATH_AUX);
                let enter = buttons[0];  
                enter.click();
            });
            
            // Check if login succeeded
            if (page.url() === process.env.NETFLIX_SUCCESS_VALUE) { // TODO: update res.send data
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
            await page.goto(process.env.HULU_LOGIN_URI);
            await page.type(process.env.HULU_USERNAME_DIV, req.query.email);
            await page.type(process.env.HULU_PASSWORD_DIV, req.query.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName(process.env.HULU_SUBMIT_PATH);
                let enter = buttons[process.env.HULU_SUBMIT_INDEX];
                enter.click();
            });
            await page.waitForNavigation();

            // Check if login succeeded
            if (page.url() === process.env.HULU_SUCCESS_VALUE) { // TODO
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
            await page.goto(process.env.CBS_LOGIN_URI);
            await page.waitForSelector(process.env.CBS_USERNAME_DIV);
            await page.type(process.env.CBS_USERNAME_DIV, req.query.email);
            await page.type(process.env.CBS_PASSWORD_DIV, req.query.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName(process.env.CBS_SUBMIT_PATH);
                let enter = buttons[process.env.CBS_SUBMIT_INDEX];
                enter.click();
            });
            await page.waitForNavigation();
            
            // Check if login succeeded
            if (page.url() === process.env.CBS_SUCCESS_VALUE) { // TODO
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
            await page.goto(process.env.SHOWTIME_LOGIN_URI);
            await page.waitForSelector(process.env.SHOWTIME_USERNAME_DIV);
            await page.type(process.env.SHOWTIME_USERNAME_DIV, req.query.email);
            await page.type(process.env.SHOWTIME_PASSWORD_DIV, req.query.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName(process.env.SHOWTIME_SUBMIT_PATH);
                let enter = buttons[process.env.SHOWTIME_SUBMIT_INDEX];
                enter.click();
            });
            await page.waitForNavigation();
        
            // Check if login succeeded
            if (page.url() === process.env.SHOWTIME_SUCCESS_VALUE) { // TODO
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