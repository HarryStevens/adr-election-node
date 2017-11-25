var request = require("request"),
	cheerio = require("cheerio"),
	io = require("indian-ocean"),
	pt = require("party-time"),
	jz = require("jeezy"),
	_ = require("underscore"),
	fsz = require("fsz")

function lookupAc(id, constituency){
	var lookup = require("../meta_data/constituency_lookup/" + id);
	return _.where(lookup, {constituency: constituency})[0];
}
function getNumberFromCol(txt){
	return txt == "Nil" ? 0 : +jz.str.replaceAll(txt.split("Rs")[1].split(" ~")[0], ",", "").trim();
}

module.exports.go = function(obj, callback){
	var out = [];

	var state = obj.state,
		year = obj.year,
		id = obj.id;

	var url = require("./get_url").candidates(id);

	console.log("Requesting candidates from the " + state + " election of " + year + "...");

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
				rows.each((row_index, row) => {

					var candidate = {};

					$(row).find("td").each((col_index, col) => {

						var txt = $(col).text().trim();
						if (col_index == 1) {
							candidate.candidate_name = txt;
							candidate.url = "http://myneta.info/" + id + "/" + $(col).find("a").attr("href");
						} else if (col_index == 2){
							candidate.constituency = txt;
						} else if (col_index == 3){
							candidate.party = txt;
						} else if (col_index == 4){
							candidate.criminal_cases = txt;
						} else if (col_index == 5){
							candidate.education = txt;
						} else if (col_index == 6){
							candidate.assets = getNumberFromCol(txt);
						} else if (col_index == 7){
							candidate.liabilities = getNumberFromCol(txt);
						}

					});

					candidate.net_assets = candidate.assets - candidate.liabilities;

					var constituency_info = lookupAc(id, candidate.constituency);
					
					var keys = Object.keys(constituency_info);
					keys.forEach(key => {
						candidate[key] = constituency_info[key];
					});
					out.push(candidate);

					fsz.mkdirIf(jz.str.toSlugCase(state), "data");
					fsz.mkdirIf(year, "data/" + jz.str.toSlugCase(state));

					if (row_index == rows.length - 1) {
						io.writeDataSync("data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidates.csv", out);
						callback(obj);
					}
					
				});
			}
		});
	});
}