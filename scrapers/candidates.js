var request = require("request"),
	cheerio = require("cheerio"),
	io = require("indian-ocean"),
	pt = require("party-time"),
	prompt = require("prompt"),
	_ = require("underscore"),
	jz = require("jeezy");

var out = [];
var options = [
	{state: "Himachal Pradesh", year: "2017", id: "HimachalPradesh2017"}
];
var states = getUniq(options, "state");

prompt.start();

var schema = {
	properties: {
		state: {
			required: true,
			message: "What state do you want? Your options are " + showList(states)
		}
	}
}

prompt.get(schema, (err, res) =>{
	if (err) throw err;

	var state = res.state;

	if (states.indexOf(state) == -1) {
		throw Error("We don't have " + state + " in our list of states. Try again.");
	}

	var years = getUniq(_.where(options, {state, state}), "year");

	var schema = {
		properties: {
			year: {
				required: true,
				message: "You entered " + state + ". Which election year? Your options are " + showList(years)
			}
		}
	}

	prompt.get(schema, (err, res) => {
		if (err) throw err;

		var year = res.year;

		if (years.indexOf(year) == -1){
			throw Error("We don't have " + year + " in our list of years for " + state + ". Try again.");
		}

		var id = _.where(options, {state: state, year: year})[0].id;
		var url = getUrl(id);

		console.log("Requesting candidates from the " + state + " election of " + year + "...");

		request(url, (err, res, body) => {
			if (err || res.statusCode !== 200) {
				console.log("Error", err);
				console.log("Status", res.statusCode);
				throw Error("Error in request");
			}

			var $ = cheerio.load(body);

			$("table").each((table_index, table) => {
				if (table_index == 1){
					var rows = $(table).find("tbody").find("tr");
					rows.each((row_index, row) => {

						var candidate = {};

						$(row).find("td").each((col_index, col) => {

							var txt = $(col).text().trim();
							if (col_index == 1) {
								candidate.candidate_name = txt;
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
						out.push(candidate);
						if (row_index == rows.length - 1) io.writeDataSync("data/" + jz.str.toSlugCase(state) + "_" + year + ".csv", out);

					});
				}
			});
		});
	});

});

function getUniq(data, variable){
	return _.chain(data).pluck(variable).uniq().value();
}
function showList(data){
	return data.map(d => "'" + d + "'").join(", ")
}
function getUrl(id){
	return "http://myneta.info/" + id + "/index.php?action=summary&subAction=candidates_analyzed&sort=candidate#summary"
}
function getNumberFromCol(txt){
	return +jz.str.replaceAll(txt.split("Rs")[1].split(" ~")[0], ",", "").trim();
}