var crypto = require('crypto');
var redis;
var valid_url_pattern = new RegExp(/https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?/);

if (process.env.REDISTOGO_URL) {
	var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var redis = require("redis").createClient(rtg.port, rtg.hostname);
	redis.auth(rtg.auth.split(":")[1]);
} else {
	redis = require('redis-url').createClient();
}

// global
var SALTS = ['Eu9yoh2le1porieha', ];

function shorten(url) {
	console.log("Shortening " + url);
	var result = new Object();
	if (valid_url_pattern.exec(url) != null) {
		var identifier = createIdentifier(url);
		var shortened = createObject(identifier, url);
		if (store(shortened)) {
			result.key = identifier;
			result.success = true;
		} else {
			result.success = false;
			result.message = "Error: Could not store key";
		}
	} else {
		result.success = false;
		result.message = 'Not a valid URL';
	}
	return result;
}

function resolve(identifier, response) {
	console.log("Resolving " + identifier);
	redis.hget(identifier, "url", function(err, data) {
		var forwardTo = data;
		console.log("Redirecting to " + forwardTo);
		redis.hincrby(identifier, "hits", 1);
		response.redirect(forwardTo);
	});
}

function createIdentifier(url) {
	var hash = crypto.createHash('sha1');
	hash.update(url + randomSalt());
	var digest = hash.digest('hex').substring(0, 6);
	console.log(digest);
	return digest;
}

function createObject(identifier, url) {
	var shortened = new Object();
	shortened.identifier = identifier;
	shortened.created = new Date();
	shortened.url = url;
	return shortened;
}

function store(shortened) {
	return redis.hset(shortened.identifier, "url", shortened.url)	
		&& redis.hset(shortened.identifier, "created", shortened.created)
		&& redis.hset(shortened.identifier, "hits", 0);
}

function randomSalt() {
	var iteration = 0;
	var salt = "";
	var randomNumber;
	if(special == undefined){
	      var special = false;
	}
	while(iteration < 10){
	   randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
    if(!special){
      if ((randomNumber >=33) && (randomNumber <=47)) { continue; }
      if ((randomNumber >=58) && (randomNumber <=64)) { continue; }
      if ((randomNumber >=91) && (randomNumber <=96)) { continue; }
      if ((randomNumber >=123) && (randomNumber <=126)) { continue; }
    }
    iteration++;
    salt += String.fromCharCode(randomNumber);
  }
  return salt;
}

exports.shorten = shorten;
exports.resolve = resolve;