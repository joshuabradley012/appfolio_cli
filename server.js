const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const shell = require('shelljs');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
	res.render('index');
});

app.post('search.js', function (req, res) {
	shell.exec('./search.js');
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000:')
});
