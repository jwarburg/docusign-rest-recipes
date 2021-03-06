//
// to run this sample
//  1. copy the file in your own directory - say, example.js
//  2. change "***" to appropriate values
//  3. install async and request packages
//     npm install async
//     npm install request
//  4. execute
//     node example.js 
// 

var 	async = require("async"),	// async module
	request = require('request'),	// request module
	email = "***",			// your account email
    	password = "***",		// your account password
	integratorKey = "***",		// your account Integrator Key (found on Preferences -> API page)
	envelopeId =  "***",		// valid envelopeId of an existing envelope in your account
	baseUrl = "";			// we will retrieve this

async.waterfall(
[
	//////////////////////////////////////////////////////////////////////
	// Step 1 - Login (used to retrieve accountId and baseUrl)
	//////////////////////////////////////////////////////////////////////
	function(next) {
		var url = "https://demo.docusign.net/restapi/v2/login_information";
		var body = "";	// no request body for login api call
		
		// set request url, method, body, and headers
		var options = initializeRequest(url, "GET", body, email, password);
		
		// send the request...
		request(options, function(err, res, body) {
			if(!parseResponseBody(err, res, body)) {
				return;
			}
			baseUrl = JSON.parse(body).loginAccounts[0].baseUrl;
			next(null); // call next function
		});
	},
	
	//////////////////////////////////////////////////////////////////////
	// Step 2 - Get Envelope Recipient Status
	//////////////////////////////////////////////////////////////////////
	function(body, next) {
			
			// append /envelopes/{envelopeId}/recipients to baseUrl and use as endpoint.
			// you can additionally append url parameter ?include_tabs=true to include
			// recipient tabs in the response:
			var url = baseUrl + "/envelopes/" + envelopeId + "/recipients?include_tabs=true";
			var body = "";	// no request body needed for get status call
			
			// set request url, method, body, and headers
			var options = initializeRequest(url, "GET", body, email, password);
		
			// send the request...
			request(options, function(err, res, body) {
				parseResponseBody(err, res, body);
			});
	}]
);

//***********************************************************************************************
// --- HELPER FUNCTIONS ---
//***********************************************************************************************
function initializeRequest(url, method, body, email, password) {	
	var options = {
		"method": method,
		"uri": url,
		"body": body,
		"headers": {}
	};
	addRequestHeaders(options, email, password);
	return options;
}

///////////////////////////////////////////////////////////////////////////////////////////////
function addRequestHeaders(options, email, password) {	
	// JSON formatted authentication header (XML format allowed as well)
	dsAuthHeader = JSON.stringify({
		"Username": email,
		"Password": password, 
		"IntegratorKey": integratorKey	// global
	});
	// DocuSign authorization header
	options.headers["X-DocuSign-Authentication"] = dsAuthHeader;
}

///////////////////////////////////////////////////////////////////////////////////////////////
function parseResponseBody(err, res, body) {
	console.log("\r\nAPI Call Result: \r\n", JSON.parse(body));
	if( res.statusCode != 200 && res.statusCode != 201)	{ // success statuses
		console.log("Error calling webservice, status is: ", res.statusCode);
		console.log("\r\n", err);
		return false;
	}
	return true;
}