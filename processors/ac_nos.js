var io = require("indian-ocean"),
	jz = require("jeezy"),
	fs = require("fs"),
	prompt = require("prompt");

var select = require("../helpers/select_election.js");

select.select(obj => {
	var path = "data/" + jz.str.toSlugCase(obj.state) + "/" + obj.year;
	var files = fs.readdirSync(path).filter(d => d !== ".DS_Store");

	var schema = {
		properties: {
			filename: {
				required: true,
				message: "What is the file name? Your options are:\n" + files.join("\n")
			},
			no_district_match: {
				required: true,
				message: "Does every constituency have a different name? (Y/N)"
			}
		}
	}

	prompt.start();

	prompt.get(schema, cb);

	function cb(err, res){
		var filename = res.filename;

		if (files.indexOf(filename) == -1) {
			console.log("That file doesn't exist. Try again.");
			process.exit();
		}

		if (res.no_district_match.toUpperCase() !== "Y" && res.no_district_match.toUpperCase() !== "N"){
			console.log("You must enter either Y or N for the matching question.");
			process.exit();
		}

		var data = io.readDataSync(path + "/" + filename);
		var lookup = require("../meta_data/constituency_lookup/" + obj.id);
		var cols = Object.keys(lookup[0]);
		data.forEach(d => {
			var m = [];
			if (res.no_district_match.toUpperCase() == "N"){
				m = lookup.filter(f => f.constituency == d.constituency && f.district == d.district)[0];	
			} else {
				m = lookup.filter(f => f.constituency == d.constituency)[0];	
			}
			cols.forEach(c => {
				d[c] = m[c];
			});
			return d;
		});
		console.log(path + "/" + filename + " now has the constituency numbers.");
		io.writeDataSync(path + "/" + filename, data);

	}

});