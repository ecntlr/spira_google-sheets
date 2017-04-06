/*
Main Google Script function (.gs)

The Utility functions needed for initialization and basic app functionality are located here.

All Google App Script (GAS) files are bundled by the engine at start up so any non-scoped variable declared will be available globally.

*/



//App script boilerplate install function
//opens app on install
function onInstall(e) {
    onOpen(e);
}

//App script boilerplate open function
//opens sidebar
// `addItem` method is related to the 'Add-on' menu items. Currently just one is listed 'Start' in the dropdown menu
function onOpen(e) {
    SpreadsheetApp.getUi().createAddonMenu()
        .addItem('Start', 'showSidebar')
        .addToUi();
}



//side bar function gets index.html and opens in side window
function showSidebar() {
    var ui = HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .setTitle('Inflectra Corporation');
    SpreadsheetApp.getUi().showSidebar(ui);
}

//This function is part of the google template engine and allows for modularization of code
function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/*  Begin non Google app functions */

//Gets projects for current logged in user returns data to main.js.html
function getProjects(currentUser) {
    var fetcherURL = '/services/v5_0/RestService.svc/projects?username=';
    return fetcher(currentUser, fetcherURL);
}

//Gets User data for current user and current project
//this function is called on log in and on project change
function getUsers(currentUser, proj) {
    var fetcherURL = '/services/v5_0/RestService.svc/projects/' + proj + '/users?username=';
    return fetcher(currentUser, fetcherURL);
}

//Gets custom fields for current user, project and artifact.
//this function is called on log in and on project change
function getCustoms(currentUser, proj, artifact) {
    var fetcherURL = '/services/v5_0/RestService.svc/projects/' + proj + '/custom-properties/' + artifact + '?username=';
    return fetcher(currentUser, fetcherURL);
}

function getReleases(currentUser, proj) {
    var fetcherURL = '/services/v5_0/RestService.svc/projects/' + proj + '/releases?username=';
    return fetcher(currentUser, fetcherURL);
}

function getComponents(currentUser, proj) {
    var fetcherURL = '/services/v5_0/RestService.svc/projects/' + proj + '/components?active_only=true&include_deleted=false&username=';
    return fetcher(currentUser, fetcherURL);
}


//Fetch function uses Googles built in fetch api
function fetcher(currentUser, fetcherURL) {

    //google base 64 encoded string utils
    var decoded = Utilities.base64Decode(currentUser.api_key);
    var APIKEY = Utilities.newBlob(decoded).getDataAsString();

    //build URL from args
    //this must be changed if using mock values in development
    var URL = currentUser.url + fetcherURL + currentUser.userName + APIKEY;
    //set MIME type
    var init = { 'content-type': 'application/json' };
    //call Google fetch function
    var response = UrlFetchApp.fetch(URL, init);
    //returns parsed JSON
    //unparsed response contains error codes if needed but if the call fails google catches the error in the `withFailureHandler` method.
    return JSON.parse(response);
}

//Error notification function
//Assigns string value and routes error call from main.js.html
function error(type) {
    if (type == 'impExp') {
        okWarn('There was an input error. Please check that your entries are correct.');
    } else if (type == 'unk') {
        okWarn('Unkown error. Please try again later or contact your system administrator');
    } else {
        okWarn('Network error. Please check your username, url, and password. If correct make sure you have the correct permissions.');
    }
}

//Pop-up notification function
function success(string) {
    // Show a 2-second popup with the title "Status" and the message "Task started".
    SpreadsheetApp.getActiveSpreadsheet().toast(string, 'Success', 2);
}


//Alert pop up for data clear warning
function warn() {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert('All data on current tab will be deleted. Continue?', ui.ButtonSet.YES_NO);

    //returns with user choice
    if (response == ui.Button.YES) {
        return true;
    } else {
        return false;
    }
}

//Alert pop up for project or artifact dropdown change
function warnProjArt() {
    okWarn('Warning! Changing the current project or artifact will clear all unsaved data.');
}

//Alert pop up for export success
function exportSuccess(err) {
    if (err) {
        okWarn('Operation complete, some errors occured. Clear sheet to export more artifacts.');
    } else {
        okWarn('Operation complete. Clear sheet to export more artifacts.');
    }
}

//Alert pop up for no template present
function noTemplate() {
    okWarn('Please load a template to continue.');
}

//Google alert popup with Ok button
function okWarn(dialoge) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(dialoge, ui.ButtonSet.OK);
}

//save function
function save() {
    //pop up telling the user that their data will be saved
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert('This will save the current sheet in a new tab. Continue?', ui.ButtonSet.YES_NO);

    //returns with user choice
    if (response == ui.Button.YES) {
        var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = spreadSheet.getSheets()[0];
        //get entire spreadsheet id
        var id = spreadSheet.getId();
        //set current spreadsheet file as destination
        var destination = SpreadsheetApp.openById(id);
        //copy to destination
        sheet.copyTo(destination);
    }
}

//clear function
//clears current sheet
function clearAll() {
    //get first active spreadsheet
    var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadSheet.getSheets()[0];

    //clear all formatting and content
    sheet.clear();
    //clears data validations from the entire sheet
    var range = SpreadsheetApp.getActive().getRange('A:AZ');
    range.clearDataValidations();
    //Reset sheet name
    sheet.setName('Sheet');
}
