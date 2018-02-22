var io = require("indian-ocean"),
	jz = require("jeezy"),
	fs = require("fs");

function doit(obj){
	var state = obj.state,
		year = obj.year,
		id = obj.id;

	// first, check to see if it exists
	if (fs.readdirSync("meta_data/constituency_lookup").indexOf(id + ".js") == -1){
		console.log("It looks like you don't have a lookup table for " + id + " yet. Making it now...");
		var data = io.readDataSync("data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidates_MASTER.csv");
		var out = [];

		var districts = jz.arr.uniqueBy(data, "district");
		districts.forEach(district => {
			var district_data = data.filter(d => d.district == district);
			var constituencies = jz.arr.uniqueBy(district_data, "constituency");
			constituencies.forEach(constituency => {
				out.push({
					constituency: constituency,
					ac_no: "",
					reservations: "",
					district: district,
					sub_region: ""
				});
			});
		});
		io.writeDataSync("meta_data/constituency_lookup/" + id + ".js", "module.exports = " + JSON.stringify(out));
		console.log("\n\nYour lookup table is ready at meta_data/constituency_lookup/" + id + ".js.\nYou must now match the constituency names with their numbers. If the counting has already happened, you can get it from http://lokdhaba.ashoka.edu.in/LokDhaba-Shiny/");
	} else {
		process.exit();
	}
}

module.exports.go = doit;