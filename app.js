const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const serviceAccount = require("./streamfox-main-firebase.json");

// require('dotenv/config');
require('dotenv').config()

const app = express();
console.log(process.env.myList[1])

app.use(bodyParser.urlencoded({ extended: true }));

// Environment variables
let serviceTypes = ['netflix', 'hulu', 'cbs', 'showtime', 'disney']
let LOGIN_URLS = [          process.env.NETFLIX_LOGIN_URL, 
                            process.env.HULU_LOGIN_URL,
                            process.env.CBS_LOGIN_URL, 
                            process.env.SHOWTIME_LOGIN_URL, 
                            process.env.DISNEY_LOGIN_URL]

let USERNAME_DIVS = [       process.env.NETFLIX_USERNAME_DIV, 
                            process.env.HULU_USERNAME_DIV,
                            process.env.CBS_USERNAME_DIV, 
                            process.env.SHOWTIME_USERNAME_DIV, 
                            process.env.DISNEY_USERNAME_DIV]

let PASSWORD_DIVS = [       process.env.NETFLIX_PASSWORD_DIV, 
                            process.env.HULU_PASSWORD_DIV,
                            process.env.CBS_PASSWORD_DIV, 
                            process.env.SHOWTIME_PASSWORD_DIV, 
                            process.env.DISNEY_PASSWORD_DIV]

let SUBMIT_PATHS = [        process.env.NETFLIX_SUBMIT_PATH, 
                            process.env.HULU_SUBMIT_PATH,
                            process.env.CBS_SUBMIT_PATH, 
                            process.env.SHOWTIME_SUBMIT_PATH, 
                            process.env.DISNEY_SUBMIT_PATH]

let SUBMIT_PATH_AUXS = [    process.env.NETFLIX_SUBMIT_PATH_AUX, 0, 0, 0, 0]

let SUBMIT_PATH_INDEXES = [ process.env.NETFLIX_SUBMIT_INDEX, 
                            process.env.HULU_SUBMIT_INDEX,
                            process.env.CBS_SUBMIT_INDEX, 
                            process.env.SHOWTIME_SUBMIT_INDEX, 
                            process.env.DISNEY_SUBMIT_INDEX]

let SUCCESS_VALUES = [      process.env.NETFLIX_SUCCESS_VALUE, 
                            process.env.HULU_SUCCESS_VALUE,
                            process.env.CBS_SUCCESS_VALUE, 
                            process.env.SHOWTIME_SUCCESS_VALUE, 
                            process.env.DISNEY_SUCCESS_VALUE]



/**
 * 
 * Connects to Firestore database
 * 
*/
async function initFirestore() {
    console.log('Initializing Firestore...')
    let db;
    let success = false
    while (!success) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://streamfox-main.firebaseio.com"
            });
            db = admin.firestore();
            success = true
        } catch {
            console.log('Error connecting to Firestore, retrying in 1 second')
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }
    console.log('Firestore initialized')
    return db;
}


/**
 * Returns service session cookies 
 * - Parameters:
 *      req.query.type - service type
 * - Returns:
 *      Type
 *      Cookies
 *      Service
*/
app.get('/getCookies', async function(req, res, next) {

    var serviceCollection = db.collection('services');
    var query = serviceCollection
        .where('type', '==', req.query.type)
        .where('isAvailable', '==', true)
        .limit(1)

    var snapshot = await query.get();
    var service = snapshot.docs.map(doc => ({__id: doc.id, ...doc.data()}))[0];
    var serviceIndex = serviceTypes.indexOf(req.query.type)

    // Setup puppeteer.js
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    try {
        // Navigate to login page
        await page.goto(LOGIN_URLS[serviceIndex]);
        await page.waitForSelector(USERNAME_DIVS[serviceIndex]);
        
        // Insert useranme and password
        await page.type(USERNAME_DIVS[serviceIndex], service.username);
        await page.type(PASSWORD_DIVS[serviceIndex], service.password);
        
        // Submit login form
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName(SUBMIT_PATHS[serviceIndex]);
            let enter = buttons[SUBMIT_PATH_INDEXES[serviceIndex]];
            enter.click();
        });
        await page.waitForNavigation();

        // Individual service navigations
        if (service.service === 'netflix') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName(SUBMIT_PATH_AUXS[serviceIndex]);
                let enter = buttons[0];  
                enter.click();
            });
            await page.waitForNavigation();
        }

        else if (service.service === 'disney') {
            await page.type(PASSWORD_DIVS[serviceIndex], service.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName(SUBMIT_PATHS[serviceIndex]);
                let enter = buttons[0];  
                enter.click();
            });
            await page.waitForNavigation();
        }

        // Get session cookies and return
        var cookies = await page.cookies();

        res.send({ 
            type: req.query.type,
            service: service,
            cookies: cookies,
        });
    }   
    catch(err) {
        res.send({ 
            type: req.query.type,
            service: service,
            cookies: null,
            error: err 
        });
    } 

    await browser.close();
});


/**
 * Returns true if credentials are valid
 * - Parameters:
 *      req.query.type      - service type
 *      req.query.email     - login email
 *      req.query.password  - login password
 * - Returns:
 *      Type
 *      isValid
*/
app.get('/isValid', async function(req, res, next) {

    var serviceIndex = serviceTypes.indexOf(req.query.type)

    // Setup puppeteer.js
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    try {
        // Navigate to login page
        await page.goto(LOGIN_URLS[serviceIndex]);
        await page.waitForSelector(USERNAME_DIVS[serviceIndex]);
        
        // Insert useranme and password
        await page.type(USERNAME_DIVS[serviceIndex], req.query.email);
        await page.type(PASSWORD_DIVS[serviceIndex], req.query.password);

        // Submit login form
        await page.evaluate(() => {
            let buttons = document.getElementsByClassName(SUBMIT_PATHS[serviceIndex]);
            let enter = buttons[SUBMIT_PATH_INDEXES[serviceIndex]];
            enter.click();
        });
        await page.waitForNavigation();

        // Individual service navigations
        if (req.query.type === 'netflix') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName(SUBMIT_PATH_AUXS[serviceIndex]);
                let enter = buttons[0];  
                enter.click();
            });
            await page.waitForNavigation();
        }

        else if (req.query.type === 'disney') {
            await page.type(PASSWORD_DIVS[serviceIndex], req.query.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName(SUBMIT_PATHS[serviceIndex]);
                let enter = buttons[0];  
                enter.click();
            });
            await page.waitForNavigation();
        }

        // Confirm if login was successful and return
        if (page.url() === SUCCESS_VALUES[serviceIndex]) {
            res.send({ 
                type: req.query.type, 
                isValid: true
            });
        } 
        else {
            res.send({ 
                type: req.query.type, 
                isValid: false 
            });
        }
    }   
    catch (err) {
        res.send({ 
            type: req.query.type, 
            isValid: null,
            error: err 
        });
    } 

    await browser.close();
});


/**
 * 
 * Starts Chrome server 
 * 
*/
app.listen(process.env.PORT || 5000, function(){
    initFirestore();
    console.log("Chrome server listening on port %d in %s mode", this.address().port, app.settings.env);
});