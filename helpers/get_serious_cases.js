var request = require("request"),
	cheerio = require("cheerio"),
	io = require("indian-ocean"),
	jz = require("jeezy");

module.exports.go = function(obj, callback){

	var state = obj.state,
		year = obj.year,
		id = obj.id;

	var out = io.readDataSync("data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidates_MASTER.csv");

	var url = require("./get_url").serious_cases(id);

	console.log("Requesting candidates with serious criminal cases.");

	request(url, (err, res, body) => {
		if (err || res.statusCode !== 200) {
			console.log("Error", err);
			console.log("Status", res.statusCode);
			throw Error("Error in request");
		}

		var $ = cheerio.load(body);
		var tables = $("table");
		tables.each((table_index, table) => {
			if (table_index == tables.length - 1){
				var rows = $(table).find("tbody").find("tr");

				if (rows.length == 0){
					console.log("No serious cases data.");
					out.forEach(d => {
						d.serious_criminal_cases = "";
						return d;
					});
					io.writeDataSync("data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidates_MASTER.csv", out);
					callback(obj);
				} else {
					rows.each((row_index, row) => {
						var url; 
						$(row).find("td").each((col_index, col) => {

							if (col_index == 1) {
								url = "http://myneta.info/" + id + "/" + $(col).find("a").attr("href");
							}

						});

						var index = require("./get_index_by")(out, "url", url);

						out[index].serious_criminal_cases = "true";
			
						if (row_index == rows.length - 1) {
							out.forEach(row => {
								if(!row.serious_criminal_cases) row.serious_criminal_cases = "false";
							});
							io.writeDataSync("data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidates_MASTER.csv", out);
							callback(obj);
						};
					});
				}
			}
		});
	});
}