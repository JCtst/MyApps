/*** MyApps.js ***/


// *** differences ***
// REQUEST /accounts returns the following states
//  	- email already in use
//	- specified email is not a valid email
//	- error creating user
// REQUEST /access_token returns the following states
//	- specified user account email is invalid
//	- user account password is incorrect
//	- user account does not exist
//	- error logging user
// REQUEST /contacts new parameter
//	- token
// REQUEST /contacts returns the following states
//	- invalid token

// used modules and libraries
// 	- express.js && body-parser && firebase && firebase-token-generator && jwt-simple && 
// used jwt-simple for tokens

// SERVICES are available at
// localhost:8080

// TEST CASE
// test.sh


var express = require('express');
var bodyParser = require('body-parser');

var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://flickering-heat-1078.firebaseio.com/");

var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator("<ULTRA SECRET>");

var jwt = require('jwt-simple');

var app = express();
app.use(bodyParser.json());



console.log("SERVICE STARTED");

/* REQ POST /accounts -> Create Account (&JSON) */
app.post('/accounts', function(req, res) {
    console.log("REQ " + req.method + " to " + req.url);
    console.log(req.body);
    
    myFirebaseRef.createUser(req.body,
      function(error) {
	if (error) {
	  
	  switch (error.code) {
	    case "EMAIL_TAKEN":
	      console.log("The new user account cannot be created because the email is already in use.");
	      res.status(500).send(" error: 'The new user account cannot be created because the email is already in use.' ");
	      break;
	    case "INVALID_EMAIL":
	      console.log("The specified email is not a valid email.");
	      res.status(500).send(" error: 'The specified email is not a valid email.' ");
	      break;
	    default:
	      console.log("Error creating user:", error);
	      res.status(500).send(" error: 'Error creating user.' ");
	  }
	} else {
	  console.log("User account created successfully!");
	  res.sendStatus(201).end();	// HTTP/1.1 201 Created
	}
      }
    );
});

/* REQ GET /acces_token -> return acces_token*/
app.get('/access_token', function(req, res) {
    console.log("REQ " + req.method + " to " + req.url);

    myFirebaseRef = new Firebase("https://flickering-heat-1078.firebaseio.com");
    
    myFirebaseRef.authWithPassword(req.query, function(error, authData) {
      if (error) {
	switch (error.code) {
	  case "INVALID_EMAIL":
	    console.log("The specified user account email is invalid.");
	    res.status(500).send(" error: 'The specified user account email is invalid.' ");
	    break;
	  case "INVALID_PASSWORD":
	    console.log("The specified user account password is incorrect.");
	    res.status(500).send(" error: 'The specified user account password is incorrect.' ");
	    break;
	  case "INVALID_USER":
	    console.log("The specified user account does not exist.");
	    res.status(500).send(" error: 'The specified user account does not exist.' ");
	    break;
	  default:
	    console.log("Error logging user in:", error);
	    res.status(500).send(" error: 'Error logging user' ");
	}
      } else {
	// return FIREBASE token
	// comment -> 6.1.2015 - changed user auth. -> https://www.firebase.com/docs/web/changelog.html  
	//console.log("Authenticated successfully with token:", authData.token);
	//res.status(200).json(authData.token);	// !!! we can return firebase token
	
	// return JWT-simple token 
	var acces_token = jwt.encode(req.query.email+";"+req.query.password, "ultramegasecret");
	console.log("Authenticated successfully with token:", acces_token);

	//res.status(200).json("{ \"acces_token\": "+acces_token+" }");
	res.status(200).json(acces_token);
      }
    });
});


/* REQ POST /contacts */
app.post('/contacts', function(req, res) {
    console.log("REQ " + req.method + " to " + req.url);
    
    // easy, but useful
    // get back email and password from token
    var tuser=jwt.decode(req.query.token,"ultramegasecret");	
    var user=tuser.substring(0, tuser.indexOf(";"));
    var password=tuser.substring(tuser.indexOf(";")+1,tuser.length);
    var tjson=JSON.parse("{ \"email\": \""+user+"\", \"password\": \""+password+"\" }");
    
    myFirebaseRef.authWithPassword(tjson, function(error, authData) {
      if (error) {
	console.log("Invalid token !!!");
	res.status(500).send(" error: 'Invalid token !!!' ");
      } else {
	uid=authData.uid.substring(authData.uid.indexOf(":")+1,authData.uid.length);	// get UID
	console.log("Authorized user: "+user+" (UID:"+uid+")");
	myFirebaseRef.child("UID"+uid).push(req.body);	// we can use .set()
	
	console.log("DATA are stored");
	res.sendStatus(201).end();	// HTTP/1.1 201 Created
      }
    });
    
});

/* REQ POST /photos?contactID=  */
app.post('/photos', function(req, res) {
  console.log("REQ " + req.method + " to " + req.url);
  console.log("contactID="+req.query.contactId);

  var tuser=jwt.decode(req.query.token,"ultramegasecret");	
  var user=tuser.substring(0, tuser.indexOf(";"));
  var password=tuser.substring(tuser.indexOf(";")+1,tuser.length);
  var tjson=JSON.parse("{ \"email\": \""+user+"\", \"password\": \""+password+"\" }");
  
  var size = 0;
  var rawBody = '';	// place for all chunks
  
  
  
  req.on('data', function (data) {
    size += data.length;
    rawBody = rawBody+ data;
    //console.log('Got chunk: ' + data.length + ' total: ' + size);
  });

  req.on('end', function () {
    console.log("DATA RECEIVED = " + size + " bytes");

    
    
//    console.log(rawBody);
    myFirebaseRef.authWithPassword(tjson, function(error, authData) {
      if (error) {
	console.log("Invalid token !!!");
	res.status(500).send(" error: 'Invalid token !!!' ");
      } else {
	uid=authData.uid.substring(authData.uid.indexOf(":")+1,authData.uid.length);	// get UID
	console.log("Authorized user: "+user+" (UID:"+uid+")");
	myFirebaseRef.child("UID"+uid+"/"+req.query.contactId+"/photo").push(rawBody);
	console.log("DATA are stored");
	res.sendStatus(201).end();	// HTTP/1.1 201 Created
      }
    });
  }); 

  req.on('error', function(error) {
    res.status(400).json(" error: "+error.message);
    console.log("ERROR ERROR: " + error.message);
  });

});

app.listen(8080);
