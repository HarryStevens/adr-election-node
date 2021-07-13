const chalk = require("chalk");
const cliSelect = require("cli-select");
const _ = require("underscore");
const inquirer = require("inquirer");
inquirer.registerPrompt("search-list", require("inquirer-search-list"));

const elections = require("../meta_data/elections");

// callback returns obj with state, year, and id
module.exports.select = function(callback){
	const states = unique(elections, "state");	
	
	inquirer
	  .prompt([
      {
        type: "search-list",
        message: "Select a state",
        name: "state",
        choices: states
      }
	  ])
	  .then(({state}) => {
			const years = unique(_.where(elections, {state, state}), "year");

			console.log(`You entered ${chalk.blue.bold(state)}. Which election year?`);

			cliSelect({
				values: years,
				valueRenderer: (value, selected) => selected ? chalk.underline(value) : value
			})
			.then(res => {
				const year = res.value;
				const obj = _.where(elections, {state: state, year: year})[0];
				
				callback(obj);
			});

		});

}

function unique(data, variable){
	return _.chain(data).pluck(variable).uniq().value();
}