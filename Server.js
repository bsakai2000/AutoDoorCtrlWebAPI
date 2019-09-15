//Initiallising node modules
var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mssql");
var app = express();

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

//Initiallising connection string
var dbConfig = {
    user:  "developer",
    password: "developer",
    server: "automaticdoorctrldev.cap2cfj45nxa.us-east-1.rds.amazonaws.com",
    database: "users"
};

//Function to connect to database and execute query
var  executeQuery = function(res, query){	
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.send(err);
		}
		else {
			// create Request object
			var request = new sql.Request();
			// query to the database
			request.query(query, function (err, rs) {
				if (err) {
					console.log("Error while querying database :- " + err);
					res.send(err);
				}
				else {
					console.log("what the server is sending back: ",rs);
					res.send(rs);
				}
			});
		}
	});	
}

// get active student data **
app.get("/api/active_user", function(req , res){
	var query = "select * from [students] where TRIM(LOWER(Status)) = 'active' ";
	executeQuery (res, query);
});

// get student request data **
app.get("/api/inactive_user", function(req , res){
	var query = "select * from [students] where TRIM(LOWER(Status)) = 'request' ";
	executeQuery (res, query);
});

//add all student requests to active**
app.get("/api/addAll", function(req , res){
	var query = "UPDATE [students] SET Status = 'Active' WHERE TRIM(LOWER(Status)) = 'request'";
	executeQuery (res, query);
});

// login to the app  for students**
app.post("/api/login", function(req , res){
	console.log(req.body.RCSid);
	var query = "select * from [students] where RCSid = '" + req.body.RCSid+"'" ;
	console.log(query);
	executeQuery (res, query);
});
// login to the app  for admin**
app.post("/api/admin/login", function(req , res){
	console.log(req.body.username);
	var query = "select * from [admin] where username = '" + req.body.username+"' and password = '" + req.body.password+"'" ;
	console.log(query);
	executeQuery (res, query);
});

//register for the app ** 
app.post("/api/request-access", function(req , res){
	console.log(req.body.RCSid);
	var query = "INSERT INTO [students] (RCSid,Status) VALUES ('"+req.body.RCSid+"', 'Request')";
	console.log(query);
	executeQuery (res, query);
});

//add singular student to active status **
app.post("/api/addtoActive", function(req , res){
	console.log(req.body.RCSid);
	var query = "UPDATE [students] SET Status = 'Active' WHERE RCSid = '" + req.body.RCSid+"'";
	console.log(query);
	executeQuery (res, query);
});

//remove a student from active access **
app.post("/api/remove", function(req , res){
	console.log(req.body.RCSid);
	var query = "DELETE FROM [students] WHERE RCSid = '" + req.body.RCSid+"'";
	console.log(query);
	executeQuery (res, query);
});

//submit a location complaint **
app.post("/api/submit-complaint", function(req , res){
	console.log(req.body.location);
	var query = "INSERT INTO [complaints] (location,message) VALUES ('"+req.body.Location+"', '"+req.body.Message+"')";
	console.log(query);
	executeQuery (res, query);
});

// list complaints made
app.get("/api/get-complaints", function(req , res){
	var query = "select * from [complaints] ";
	executeQuery (res, query);
});
