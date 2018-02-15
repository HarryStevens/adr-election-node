// callback returns obj with state, year, and id
module.exports.select = function(callback){
	var prompt = require("prompt"),
		_ = require("underscore"),
		elections = require("../meta_data/elections");

	var states = getUniq(elections, "state");	

	prompt.start();

	var schema = {
		properties: {
			state: {
				required: true,
				message: "What state do you want? Your options are:\n" + showList(states) + "\n\nNOTE: If you do not see the state you need, you can add it to meta_data/elections.js"
			}
		}
	}

	prompt.get(schema, (err, res) =>{
		if (err) throw err;

		var state = res.state;

		if (states.indexOf(state) == -1) {
			console.log("We don't have " + state + " in our list of states. Try again.");
			return;
		}

		var years = getUniq(_.where(elections, {state, state}), "year");

		var schema = {
			properties: {
				year: {
					required: true,
					message: "You entered " + state + ". Which election year? Your options are:\n" + showList(years) + "\n\nNOTE: If you do not see the year you need, you can add it to meta_data/elections.js"
				}
			}
		}

		prompt.get(schema, (err, res) => {
			if (err) throw err;

			var year = res.year;

			if (years.indexOf(year) == -1){
				console.log("We don't have " + year + " in our list of years for " + state + ". Try again.");
				return;
			}

			var obj = _.where(elections, {state: state, year: year})[0];
			
			callback(obj);

		});

	});

	function getUniq(data, variable){
	return _.chain(data).pluck(variable).uniq().value();
	}
	function showList(data){
		return data.filter(d => d != ".DS_Store").sort().join("\n");
	}
}