var express = require('express');
var geoip = require('geoip-lite');
var useragent = require('express-useragent');
var parse = require('url-parse');
var app = express();
var mysql = require('mysql');
require('dotenv').config()

var con = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

app.use(useragent.express());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', express.static('serve'))

app.get('/funnyCatPhoto.gif', function(req, res){

	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	var url = "";

	if (req.query.domain){

		url = parse("https://"+ req.query.domain +  parse(req.header('Referer'), true).pathname, true);
	
	} else {
		url = parse(req.header('Referer'), true);
	}

	if (url.hostname == "" && url.pathname == ""){
		var buf = new Buffer(43);
        	buf.write("R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", "base64");
        	res.send(buf, { 'Content-Type': 'image/gif' }, 200);
		return;
	}

	var data = [(Math.floor((new Date() / 1000)/60/60)), url.hostname, url.pathname, ip, req.useragent.browser, geoip.lookup(ip).country, req.useragent.os];

	let command = 'INSERT INTO `requests` (id, time, domain, path, ip, browser, country, os) VALUES (0, ?, ?, ?, ?, ?, ?, ?)';
	con.query(command, data, function(err, result) {
	});

	var buf = new Buffer(43);
	buf.write("R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", "base64");
	res.send(buf, { 'Content-Type': 'image/gif' }, 200);
});

app.get('/api/v1/:domain/browsers', function(req, res){

	let command = 'SELECT `browser`, COUNT(browser) FROM `requests` WHERE `domain` = ? GROUP BY `browser` ORDER BY COUNT(*) DESC LIMIT 10'

	con.query(command, req.params.domain, function(err, result){
		res.json(result);
	})

});


app.get('/api/v1/:domain/countries', function(req, res){

        let command = 'SELECT `country`, COUNT(country) FROM `requests` WHERE `domain` = ? GROUP BY `country` ORDER BY COUNT(*) DESC LIMIT 10'

        con.query(command, req.params.domain, function(err, result){
                res.json(result);
        })

});

app.get('/api/v1/:domain/os', function(req, res){

        let command = 'SELECT `os`, COUNT(os) FROM `requests` WHERE `domain` = ? GROUP BY `os` ORDER BY COUNT(*) DESC LIMIT 10'

        con.query(command, req.params.domain, function(err, result){
                res.json(result);
        })

});

app.get('/api/v1/:domain/paths', function(req, res){

        let command = 'SELECT `path`, COUNT(path) FROM `requests` WHERE `domain` = ? GROUP BY `path` ORDER BY COUNT(*) DESC LIMIT 10'

        con.query(command, req.params.domain, function(err, result){
                res.json(result);
        })

});

app.get('/api/v1/:domain/requests', function(req, res){

        let command = 'SELECT COUNT(*) FROM `requests` WHERE domain = ?'

        con.query(command, req.params.domain, function(err, result){
                res.json(result);
        })

});

app.get('/api/v1/:domain/ips', function(req, res){

        let command = 'SELECT COUNT(DISTINCT ip) FROM requests WHERE domain = ?'

        con.query(command, req.params.domain, function(err, result){
                res.json(result);
        })

});


app.get('/api/v1/:domain/requests/:hour', function(req, res){

	var time = (Math.floor((new Date() / 1000)/60/60)) - Number(req.params.hour);

        let command = 'SELECT `time`, COUNT(time) FROM `requests` WHERE `time` > ? AND `domain` = ? GROUP BY `time`'

        con.query(command, [time, req.params.domain], function(err, result){
                res.json(result);
        })

});

app.listen(3011);
