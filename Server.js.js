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

// login to the app ** [] if not registereds
app.post("/api/login", function(req , res){
	console.log(req.body.RCSid);
	var query = "select * from [students] where RCSid = '" + req.body.RCSid+"'" ;
	console.log(query);
	executeQuery (res, query);
});

//register for the app ** 
app.post("/api/request-access", function(req , res){
	var query = "INSERT INTO [students] (RCSid,Status) VALUES ('"+req.body.RCSid+"', 'Request')";
	executeQuery (res, query);
});

//add singular student to active status **
app.put("/api/adduser/:RCSid", function(req , res){
	var query = "UPDATE [students] SET Status = 'Active' WHERE RCSid = '" + req.params.RCSid+"'";
	executeQuery (res, query);
});

/*app.post("/api/adduser", function(req , res){
	var query = "UPDATE [students] SET Status = 'Active' WHERE RCSid = '" + req.body.RCSid+"'";
	executeQuery (res, query);
});*/

//add all student requests to active**
app.get("/api/addAll", function(req , res){
	var query = "UPDATE [students] SET Status = 'Active' WHERE TRIM(LOWER(Status)) = 'request'";
	executeQuery (res, query);
});

//remove a student from active access
app.delete("/api/remove/:RCSid", function(req , res){
	var query = "DELETE FROM [students] WHERE RCSid = '" + req.params.RCSid+"'";
	executeQuery (res, query);
});


//example queries
/*
//POST API
 app.post("/api/user", function(req , res){
	var query = "INSERT INTO [students] (Name,Email,Password) VALUES (req.body.Name,req.body.Email,req.body.Password)";
	executeQuery (res, query);
});

//PUT API
 app.put("/api/user/:id", function(req , res){
	var query = "UPDATE [students] SET Name= " + req.body.Name  +  " , Email=  " + req.body.Email + "  WHERE Id= " + req.params.id;
	executeQuery (res, query);
});

/*
// DELETE API
 app.delete("/api/user /:id", function(req , res){
	var query = "DELETE FROM [students] WHERE Id=" + req.params.id;
	executeQuery (res, query);
});
*/
