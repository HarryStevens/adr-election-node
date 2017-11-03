var io = require("indian-ocean"),
	pt = require("party-time"),
	jz = require("jeezy"),
	fs = require("fs"),
	prompt = require("prompt"),
	select = require("../helpers/select_election");

select.select(obj => {
	var path = "data/" + jz.str.toSlugCase(obj.state) + "/" + obj.year;
	var files = fs.readdirSync(path);

	var schema = {
		properties: {
			filename: {
				required: true,
				message: "Whats the file name? Your options are:\n" + files.join("\n")
			}
		}
	}

	prompt.start();

	prompt.get(schema, cb)

	function cb(err, res){
		if (err) throw err;

		var filename = res.filename;

		if (files.indexOf(filename) == -1) throw Error("That file doesn't exist. Try again.")

		var data = io.readDataSync(path + "/" + filename);

		data.forEach(row => {

			var type = pt.getType(row.party);
			row.party_eci = type == "abbr" ? pt.convert(row.party) : row.party;
			return row;

		});

		console.log(path + "/" + filename + " has been partified!")

		io.writeDataSync(path + "/" + filename, data);
	}
})

