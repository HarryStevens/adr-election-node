var io = require("indian-ocean"),
	pt = require("party-time"),
	jz = require("jeezy"),
	fs = require("fs"),
	prompt = require("prompt");

var files = fs.readdirSync("data");

var schema = {
	properties: {
		filename: {
			required: true,
			message: "Whats the filename? Your options are:\n" + files.join("\n")
		}
	}
}


prompt.start();

prompt.get(schema, cb)

function cb(err, res){
	if (err) throw err;

	var filename = res.filename;

	if (files.indexOf(filename) == -1) throw Error("That file doesn't exist. Try again.")

	var data = io.readDataSync("data/" + filename);

	data.forEach(row => {

		var type = pt.getType(row.party);
		row.party_eci = type == "abbr" ? pt.convert(row.party) : row.party;
		return row;

	});

	console.log("data/" + filename + " has been partified!")

	io.writeDataSync("data/" + filename, data);
}