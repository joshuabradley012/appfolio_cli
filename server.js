const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const shell_exec = require('shell_exec').shell_exec;
const server = express();
var port = process.env.PORT || 8080;

server.use(express.static('public'));
server.use(bodyParser.urlencoded({ extended: true }));
server.set('view engine', 'ejs')

server.get('/', function (req, res) {
	res.render('index');
});

server.post('/search.js', function (req, res) {
	var result = shell_exec('node search.js "rent" solarentals');
});

server.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});
server.timeout = 360000;
