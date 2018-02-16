var cheerio = require("cheerio"),
	request = require("request"),
	jz = require("jeezy"),
	io = require("indian-ocean"),
	prompt = require("prompt"),
	fs = require("fs");

var select = require("../helpers/select_election");

select.select(obj => {
	var out = [];

	var state = obj.state,
		year = obj.year,
		id = obj.id;

	if (fs.readdirSync("meta_data/constituency_lookup").indexOf(id + ".js") !== -1){

		var schema = {
			properties: {
				doit: {
					required: true,
					message: "\n\nmeta_data/constituency_lookup/" + id + ".js already exists. Are you sure you want to overwrite it? (Y/N)"
				}
			}
		}

		prompt.get(schema, (error, response) => {
			if (error) {
				console.log(error);
				process.exit();
			}

			if (response.doit == "Y" || response.doit == "y"){
				doit();
			} else {
				process.exit();
			}
		});

	} else {
		doit();
	}

	function doit(){

		console.log("Getting constituency list from " + state + ", " + year + ".")

		var url = require("../helpers/get_url").candidates(id);

		request(url, (error, response, body) => {

			var $ = cheerio.load(body);
			$("table").each((table_index, table) => {
				if (table_index == obj.table_index){
					$(table).find("tbody").find("tr").each((row_index, row) => {
						out.push($(row).find("td:nth-of-type(3)").text().trim());
					});
				}
			});

			out = jz.arr.unique(out).sort().map(d => {
				return {
					constituency: d,
					ac_no: "",
					reservations: "",
					district: "",
					sub_region: ""
				};
			});

			console.log("Writing meta_data/constituency_lookup/" + id + ".js");
			io.writeDataSync("meta_data/constituency_lookup/" + id + ".js", "module.exports = " + JSON.stringify(out));

		});	
	}
	
});