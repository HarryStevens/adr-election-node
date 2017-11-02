var io = require("indian-ocean");
	_ = require("underscore"),
	jz = require("jeezy"),
	select = require("../helpers/select_election");

select.select(function(obj){
	var state = obj.state,
		year = obj.year,
		id = obj.id;	
	var types = ["candidates", "itr", "no_pan", "serious_cases", "women"];
	var data = {};
	types.forEach(type => {
		data[type] = io.readDataSync("./data/" + jz.str.toSlugCase(state) + "_" + year + "_" + type + ".csv");
	});

	data.candidates.forEach(candidate => {
		var lookup_obj = {candidate_name: candidate.candidate_name, constituency: candidate.constituency, party: candidate.party, ac_no: candidate.ac_no};
		getLookupVal("women", "gender", "Male");
		getLookupVal("serious_cases", "serious_criminal_cases", "false");
		getLookupVal("no_pan", "declared_pan", "true");
		getLookupVal("itr", "filed_itr", "false");

		function getLookupVal(type, attr, alt){
			var lookup = _.where(data[type], lookup_obj)[0];
			candidate[attr] = lookup ? lookup[attr] : alt;
		}
	});

	io.writeDataSync("data/" + jz.str.toSlugCase(state) + "_" + year + "_" + "master.csv", data.candidates);

});

