
/**
 * Module dependencies.
 */

var express = require('express'), shortener = require('./shortener');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
	console.log('Show home page.');
  res.render('index', {
    title: 'Not Another URL Shortener'
  });
});

app.get('/shorten', function(req, res) {
	console.log('Shortening url...');	
	var result = shortener.shorten(req.param('u'));
	res.send(result);
});

app.get('/:key', function(req, res) {
	console.log('Resolving shortened url...');	
	shortener.resolve(req.param('key'), res);
});

var port = process.env.PORT || 3000;

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
