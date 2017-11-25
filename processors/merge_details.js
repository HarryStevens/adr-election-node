var io = require("indian-ocean"),
	jz = require("jeezy"),
	select = require("../helpers/select_election.js");

select.select(cb);

function cb(object){
	var state = object.state,
		year = object.year,
		id = object.id;
	
	var file_start = "data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year;
	var candidates = io.readDataSync(file_start + "_candidates.csv");
	var details = io.readDataSync(file_start + "_candidate-details.csv");

	var merged = jz.arr.merge(candidates, details, "url");
	merged = jz.arr.removeProperty(merged, ["candidate_name2", "url2", "constituency2", "party2"])
  
  var out_file = file_start + "_candidates_MASTER.csv";
  console.log(state + " " + year + " has been merged into " + out_file);
  io.writeDataSync(out_file, merged);

}
