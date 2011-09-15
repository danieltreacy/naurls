var crypto = require('crypto');
var redis;
var valid_url_pattern = new RegExp(/https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?/);

if (process.env.REDISTOGO_URL) {
	redis = require('redis-url').connect(process.env.REDISTOGO_URL);
} else {
	redis = require('redis-url').createClient();
}

// global
var SALT = 'Eu9yoh2le1porieha';

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
	hash.update(url + SALT);
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

exports.shorten = shorten;
exports.resolve = resolve;