//Initiallising node modules
var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var app = express();
var bcrypt = require("bcrypt");

// Setting Base directory
app.use(bodyParser.json());

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

//Setting up server
 var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
 });

var connection = mysql.createConnection({
	user:		"developer",
	password:	"developer",
	host:		"192.168.56.103",
	database:	"users"
});

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
app.get("/api/active_user", function(req , res){
	var query = "select * from students where Status = 'Active' ";
	executeQuery (res, query);
});

// get student request data **
app.get("/api/inactive_user", function(req , res){
	var query = "select * from students where Status = 'Request' ";
	executeQuery (res, query);
});

//add all student requests to active**
app.get("/api/addAll", function(req , res){
	var query = "UPDATE students SET Status = 'Active' WHERE Status = 'Request'";
	executeQuery (res, query);
});

// login to the app  for students**
app.post("/api/login", function(req , res){
	console.log(req.body.RCSid);
	var query = "select * from `students` where `RCSid` = '" + req.body.RCSid +"'" ;
	console.log(query);
	executeQuery (res, query);
});

// login to the app  for admin**
app.post("/api/admin/login", function(req , res){
	console.log(req.body.username);
	//get the admin with this username
	var query = "select * from admin where username = '" + req.body.username + "'";
	console.log(query);
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
							console.log(results);
							res.send(results);
						}
						else {
							console.log("Wrong password!");
							res.send([]);
						}
					}

				});
			}
			else {
				console.log("No matching users found");
				res.send([]);
			}
		}
	});
});

//register for the app ** 
app.post("/api/request-access", function(req , res){
	console.log(req.body.RCSid);
	var query = "INSERT INTO students (RCSid,Status) VALUES ('" + req.body.RCSid + "', 'Request')";
	console.log(query);
	executeQuery (res, query);
});

//add singular student to active status **
app.post("/api/addtoActive", function(req , res){
	console.log(req.body.RCSid);
	var query = "UPDATE students SET Status = 'Active' WHERE RCSid = '" + req.body.RCSid+"'";
	console.log(query);
	executeQuery (res, query);
});

//remove a student from active access **
app.post("/api/remove", function(req , res){
	console.log(req.body.RCSid);
	var query = "DELETE FROM students WHERE RCSid = '" + req.body.RCSid+"'";
	console.log(query);
	executeQuery (res, query);
});

//submit a location complaint **
app.post("/api/submit-complaint", function(req , res){
	console.log(req.body.location);
	var query = "INSERT INTO complaints (location,message) VALUES ('"+req.body.Location+"', '"+req.body.Message+"')";
	console.log(query);
	executeQuery (res, query);
});

// list complaints made
app.get("/api/get-complaints", function(req , res){
	var query = "select * from complaints ";
	executeQuery (res, query);
});

// get list of doors
app.get("/api/get-doors", function(req, res){
	var query = "select * from doors";
	executeQuery (res, query);
});
