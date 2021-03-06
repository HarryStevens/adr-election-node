var request = require("request"),
	cheerio = require("cheerio"),
	io = require("indian-ocean"),
	jz = require("jeezy");

module.exports.go = function(obj, callback){

	var state = obj.state,
		year = obj.year,
		id = obj.id;

	var out = io.readDataSync("data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidates_MASTER.csv");

	var url = require("./get_url").recontest(id);

	console.log("Requesting recontesting candidates.");

	request(url, (err, res, body) => {
		if (err || res.statusCode !== 200) {
			console.log("Error", err);
			console.log("Status", res.statusCode);
			throw Error("Error in request");
		}

		var $ = cheerio.load(body);

		var rows = $(".divTableWithFloatingHeader").find("tr");
		if (rows.length < 4){
			console.log("No recontesting data.")
			
			out.forEach(d => {
				d.recontest_url = "";
				d.recontest_assets_this = "";
				d.recontest_assets_last = "";
				d.recontest_assets_change = "";
				d.recontest_remarks = "";
				return d;
			});
			io.writeDataSync("data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidates_MASTER.csv", out);
			console.log("Scraper done. File: data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidates_MASTER.csv");
			callback(obj);
		} else {
			rows.each((i, d) => {

	      if (i >= 2 && i != rows.length - 1){
	        
	        var write_obj = {};

	        var url;
	        
	        $(d).find("td").each(function(i, c){

	          if (i == 1){
	          	write_obj.recontest_url = $(c).find("a").attr("href");
	            url = "http://myneta.info/" + id + "/candidate.php?candidate_id=" + write_obj.recontest_url.split("&id1=")[1].split("&")[0]; 
	          } else if (i == 2){
	            write_obj.recontest_assets_this = +jz.str.replaceAll($(c).text().split("  ")[0],",","");
	          } else if (i == 3){
	            write_obj.recontest_assets_last = +jz.str.replaceAll($(c).text().split("  ")[0],",","");
	          } else if (i == 4){
	            write_obj.recontest_assets_change = +jz.str.replaceAll($(c).text().split("  ")[0],",","");
	          } else if (i == 5){
	            write_obj.recontest_assets_change_pct = $(c).text();
	          } else if (i == 6){
	            write_obj.recontest_remarks = $(c).text().trim();
	          }

	        });

	        var index = require("./get_index_by")(out, "url", url);

	        // maybe it looks up a candidate we don't already have?
	        if (index != -1){
	        	Object.keys(write_obj).forEach(key => {
		        	out[index][key] = write_obj[key];
		        });	
	        } else {
	        	console.log("Missing data for " + url);
	        }
		
					if (i == rows.length - 2) {
						out.forEach(row => {
							Object.keys(write_obj).forEach(key => {
			        	if (!row[key]) row[key] = "";
			        });
						});

						// format the final thing
						var cols = ["state", "year", "constituency", "ac_no", "district", "sub_region", "reservations", "candidate_name", "party", "party_eci", "url", "winner", "gender", "age", "so_do", "address", "profession", "spouse_profession", "criminal_cases", "serious_criminal_cases", "education", "assets", "liabilities", "net_assets", "filed_itr", "declared_pan", "recontest_url", "recontest_assets_this", "recontest_assets_last", "recontest_assets_change", "recontest_remarks"];
						out = out.map(d => {
							var obj = {};
							cols.forEach(col => {
								obj[col] = d[col];
							});
							return obj;
						});

						io.writeDataSync("data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidates_MASTER.csv", out);
						
						console.log("Scraper done. File: data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidates_MASTER.csv");
						callback(obj);
					};

	      }

	    });
		}

    

	});
}