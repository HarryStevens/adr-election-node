var io = require("indian-ocean"),
	pt = require("party-time"),
	jz = require("jeezy"),
	fs = require("fs"),
	prompt = require("prompt"),
	select = require("../helpers/select_election");

select.select(obj => {
	var path = "data/" + jz.str.toSlugCase(obj.state) + "/" + obj.year;
	var files = fs.readdirSync(path).filter(d => d !== ".DS_Store");

	if (files.length == 0){
		console.log("No files in " + path);
		process.exit();
	} else if (files.length == 1){
		doit(files[0]);
	} else {
		var schema = {
			properties: {
				filename: {
					required: true,
					message: "Whats the file name? Your options are:\n" + files.join("\n")
				}
			}
		}

		prompt.start();

		prompt.get(schema, (err, res) =>{
			if (err) throw err;

			doit(res.filename);
		});
	}

	function doit(filename){
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

});

