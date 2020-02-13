const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const yaml = require('js-yaml');
const fs   = require('fs');
const serviceAccount = require("./streamfox-main-firebase.json");

var config;
let db;

try {
    config = yaml.safeLoad(fs.readFileSync('service-config.yaml', 'utf8'));
} catch (e) {
    console.log(e);
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * 
 * Connects to Firestore database
 * 
*/
async function initFirestore() {
    console.log('Initializing Firestore...')
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

    var type = req.query.type

    var serviceCollection = db.collection('services');
    var query = serviceCollection
        .where('type', '==', type)
        .where('isAvailable', '==', true)
        .limit(1)

    var snapshot = await query.get();
    var service = snapshot.docs.map(doc => ({__id: doc.id, ...doc.data()}))[0];

    // Setup puppeteer.js
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    try {
        // Navigate to login page
        await page.goto(config[type].loginUrl);
        await page.waitForSelector(config[type].usernameField);
        
        // Insert useranme and password
        await page.type(config[type].usernameField, service.username);
        await page.type(config[type].passwordField, service.password);

        if (type === 'netflix') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("login-button");
                let enter = buttons[0];
                enter.click();
            });
            await page.waitForNavigation();

            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("profile-icon");
                let enter = buttons[0];  
                enter.click();
            });
            // await page.waitForNavigation();
        }

        // TODO: broken
        else if (type === 'hulu') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("login-button");
                let enter = buttons[1];
                enter.click();
            });
            // await page.waitForNavigation();
        }

        else if (type === 'cbs') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("button");
                let enter = buttons[0];
                enter.click();
            });
            await page.waitForNavigation();
        }

        else if (type === 'showtime') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("button");
                let enter = buttons[0];
                enter.click();
            });
            await page.waitForNavigation();
        }

        else if (type === 'disney') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("sc-iRbamj dfsHAW");
                let enter = buttons[0];
                enter.click();
            });
            await page.waitForNavigation();

            await page.type("#password", req.query.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("sc-iRbamj dfsHAW");
                let enter = buttons[0];  
                enter.click();
            });
        }
        
        // Get session cookies and return
        var cookies = await page.cookies();

        res.send({ 
            type: type,
            service: service,
            cookies: cookies,
        });
    }   
    catch(err) {
        res.send({ 
            type: type,
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

    var type = req.query.type
    
    // Setup puppeteer.js
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    try {
        // Navigate to login page
        await page.goto(config[type].loginUrl);
        await page.waitForSelector(config[type].passwordField);
        
        // Insert useranme and password
        await page.type(config[type].usernameField, req.query.email);
        await page.type(config[type].passwordField, req.query.password);
        
        if (type === 'netflix') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("login-button");
                let enter = buttons[0];
                enter.click();
            });
            await page.waitForNavigation();

            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("profile-icon");
                let enter = buttons[0];  
                enter.click();
            });
            // await page.waitForNavigation();
        }

        // TODO: broken
        else if (type === 'hulu') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("login-button");
                let enter = buttons[1];
                enter.click();
            });
            // await page.waitForNavigation();
        }

        else if (type === 'cbs') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("button");
                let enter = buttons[0];
                enter.click();
            });
            await page.waitForNavigation();
        }

        else if (type === 'showtime') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("button");
                let enter = buttons[0];
                enter.click();
            });
            await page.waitForNavigation();
        }

        else if (type === 'disney') {
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("sc-iRbamj dfsHAW");
                let enter = buttons[0];
                enter.click();
            });
            await page.waitForNavigation();

            await page.type("#password", req.query.password);
            await page.evaluate(() => {
                let buttons = document.getElementsByClassName("sc-iRbamj dfsHAW");
                let enter = buttons[0];  
                enter.click();
            });
            await page.waitForNavigation();
        }

        // Check success
        if (page.url() === config[type].successValue) {
            res.send({ 
                type: type, 
                isValid: true
            });
        } 
        else {
            res.send({ 
                type: type, 
                isValid: false 
            });
        }
    }   
    catch (err) {
        res.send({ 
            type: type, 
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
const PORT = 8080;
const HOST = '0.0.0.0';

// app.listen(process.env.PORT || 5000, function(){
app.listen(PORT, function(){

    initFirestore();
    console.log("Chrome server listening on port %d in %s mode", this.address().port, app.settings.env);
});