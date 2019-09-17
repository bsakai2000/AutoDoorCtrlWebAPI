//Initiallising node modules
var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var app = express();
var bcrypt = require("bcrypt");
var fs = require("fs");
var jwt = require("jsonwebtoken");
var jwtExpress = require("express-jwt");

// Setting Base directory
app.use(bodyParser.json());

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "http://192.168.56.104:4200");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

//Setting up server
 var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
 });

//Setup database connection
var connection = mysql.createConnection({
	user:		"developer",
	password:	"developer",
	host:		"192.168.56.103",
	database:	"users"
});

//RSA key pair used to generate/authenticate JWT session tokens
const ADMIN_RSA_PRIVATE_KEY = fs.readFileSync('./private.key');
const ADMIN_RSA_PUBLIC_KEY = fs.readFileSync('./public.key');
//Middleware function that throws UnauthorizedError unless Authorization header contains a valid session cookie
var adminAuth = jwtExpress({secret : ADMIN_RSA_PUBLIC_KEY});

//Function to connect to database and execute query
var  executeQuery = function(res, query){	
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("Database error :- " + error);
			res.send(error);
		}
		else {
			console.log(results);
			res.send(results);
		}
	});
}

// get active student data **
app.get("/api/active_user", adminAuth, function(req , res){
	var query = "select * from students where Status = 'Active' ";
	executeQuery (res, query);
});

// get student request data **
app.get("/api/inactive_user", adminAuth, function(req , res){
	var query = "select * from students where Status = 'Request' ";
	executeQuery (res, query);
});

//add all student requests to active**
app.get("/api/addAll", adminAuth, function(req , res){
	var query = "UPDATE students SET Status = 'Active' WHERE Status = 'Request'";
	executeQuery (res, query);
});

// login to the app  for students**
app.post("/api/login", function(req , res){
	var query = "select * from `students` where `Status` = 'Active' and `RCSid` = " + mysql.escape(req.body.RCSid);
	executeQuery (res, query);
});

// login to the app  for admin**
app.post("/api/admin/login", function(req , res){
	console.log(req.body.username);
	//get the admin with this username
	var query = "select * from admin where username = " + mysql.escape(req.body.username);
	connection.query(query, function (connError, results, fields) {
		if (connError) {
			console.log("Database error :- " + connError);
			res.send(connError);
		}
		else {
			//if there is a user with this username, check passwords. Otherwise fail
			if(results.length > 0) {
				bcrypt.compare(req.body.password, results[0].password, function(bcryptError, hashMatches) {
					if (bcryptError) {
						console.log("bcrypt error :- " + bcryptError);
						res.send(bcryptError);
					}
					else {
						//if the hash matches, password is good and we can login. Otherwise, fail
						if(hashMatches) {
							var jwtBearerToken = jwt.sign({}, ADMIN_RSA_PRIVATE_KEY, {
								algorithm: 'RS256',
								expiresIn: 3600,
								subject: results[0].username
							});
							//send the session token as a cookie to the client along with the admin entry
							res.cookie("SESSIONID", jwtBearerToken);
							res.send({SESSIONID : jwtBearerToken});
						}
						else {
							res.send([]);
						}
					}

				});
			}
			else {
				res.send([]);
			}
		}
	});
});

//register for the app ** 
app.post("/api/request-access", function(req , res){
	var query = "INSERT INTO students (RCSid,Status) VALUES (" + mysql.escape(req.body.RCSid) + ", 'Request')";
	executeQuery (res, query);
});

//add singular student to active status **
app.post("/api/addtoActive", adminAuth, function(req , res){
	var query = "UPDATE students SET Status = 'Active' WHERE RCSid = " + mysql.escape(req.body.RCSid);
	executeQuery (res, query);
});

//remove a student from active access **
app.post("/api/remove", adminAuth, function(req , res){
	var query = "DELETE FROM students WHERE RCSid = " + mysql.escape(req.body.RCSid);
	executeQuery (res, query);
});

//submit a location complaint **
app.post("/api/submit-complaint", function(req , res){
	var query = "INSERT INTO complaints (location,message) VALUES (" + mysql.escape(req.body.Location) + ", " + mysql.escape(req.body.Message) + ")";
	executeQuery (res, query);
});

// list complaints made
app.get("/api/get-complaints", adminAuth, function(req , res){
	var query = "select * from complaints ";
	executeQuery (res, query);
});

// get list of doors
app.get("/api/get-doors", function(req, res){
	var query = "select * from doors";
	executeQuery (res, query);
});
