const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const shell_exec = require('shell_exec').shell_exec;
const app = express();
var port = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
	res.render('index');
});

app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});