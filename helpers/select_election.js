const chalk = require("chalk");
const cliSelect = require("cli-select");
const _ = require("underscore");
const prompt = require("prompt");
const elections = require("../meta_data/elections");

// callback returns obj with state, year, and id
module.exports.select = function(callback){
	const states = getUniq(elections, "state");	

  prompt.start();

  var schema = {
    properties: {
      state: {
        required: true,
        message: "What state do you want? Your options are:\n" + showList(states) + "\n\nNOTE: If you do not see the state you need, you can add it to meta_data/elections.js"
      }
    }
  }

	prompt.get(schema, (err, res) => {
		if (err) throw err;

		const { state } = res;

		if (!states.includes(state)){
			console.log(`We don't have ${state} in our list of states. Try again.`);
			return;
		}

		const years = getUniq(_.where(elections, {state, state}), "year");

		console.log(`You entered ${chalk.blue.bold(state)}. Which election year?`);

		cliSelect({
			values: years,
			valueRenderer
		})
		.then(res => {
			const year = res.value;
			const obj = _.where(elections, {state: state, year: year})[0];
			
			callback(obj);
		});

	});
}

function getUniq(data, variable){
return _.chain(data).pluck(variable).uniq().value();
}
function showList(data){
	return data.filter(d => d != ".DS_Store").sort().join("\n");
}
function valueRenderer(value, selected){
  return selected ? chalk.underline(value) : value;
}