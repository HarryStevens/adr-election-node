var request = require("request"),
	cheerio = require("cheerio"),
	io = require("indian-ocean"),
	jz = require("jeezy");

module.exports.go = function(obj, callback){

	var state = obj.state,
		year = obj.year,
		id = obj.id;

	var out = io.readDataSync("data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidates_MASTER.csv");

	var url = require("./get_url").women(id);

	console.log("Requesting female candidates.");

	request(url, (err, res, body) => {
		if (err || res.statusCode !== 200) {
			console.log("Error", err);
			console.log("Status", res.statusCode);
			throw Error("Error in request");
		}

		var $ = cheerio.load(body);

		$("table").each((table_index, table) => {
			if (table_index == obj.table_index){
				var rows = $(table).find("tbody").find("tr");
				if (rows.length == 0){
					console.log("No gender data.");
					out.forEach(d => {
						d.gender = "";
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

						out[index].gender = "Female";
			
						if (row_index == rows.length - 1) {
							out.forEach(row => {
								if(!row.gender) row.gender = "Male";
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