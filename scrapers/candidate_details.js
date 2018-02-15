var io = require("indian-ocean"),
	_ = require("underscore"),
	select = require("../helpers/select_election.js"),
	request = require("request"),
	cheerio = require("cheerio"),
	jz = require("jeezy");

_.rateLimit = function(func, rate, async) {
  var queue = [];
  var timeOutRef = false;
  var currentlyEmptyingQueue = false;
  
  var emptyQueue = function() {
    if (queue.length) {
      currentlyEmptyingQueue = true;
      _.delay(function() {
        if (async) {
          _.defer(function() { queue.shift().call(); });
        } else {
          queue.shift().call();
        }
        emptyQueue();
      }, rate);
    } else {
      currentlyEmptyingQueue = false;
    }
  };
  
  return function() {
    var args = _.map(arguments, function(e) { return e; }); // get arguments into an array
    queue.push( _.bind.apply(this, [func, this].concat(args)) ); // call apply so that we can pass in arguments as parameters as opposed to an array
    if (!currentlyEmptyingQueue) { emptyQueue(); }
  };
};

var data = [];

select.select(cb);

function cb(object){
	var state = object.state,
		year = object.year,
		id = object.id;

	console.log("Scraping candidate details from the " + year + " " + state + " election.");

	request("http://myneta.info/" + id + "/index.php?action=summary&subAction=candidates_analyzed&sort=candidate", function(error, response, body){
		if (!error && response.statusCode == 200){

			var $ = cheerio.load(body);

			$("table").each(function(table_index, table){

				if (table_index == object.table_index){

					var rows = $(table).find("tr");

					console.log("Rows: ", rows.length);

					var scrape_row_limited = _.rateLimit(scrape_row, 1000);

					rows.each(function(row_index, row){

						if (row_index > 1){
							scrape_row_limited(row_index, row);
						}

					});

					function scrape_row(row_index, row){

						var obj = {};
						obj.state = state;
						obj.year = year;

						var cells = $(row).find("td");

						cells.each(function(cell_index, cell){

							var cell_text = $(cell).text().trim();

							if (cell_index == 1){
								obj.candidate_name = cell_text;
								obj.url = "http://myneta.info/" + id + "/" + $(cell).find("a").attr("href");
							} else if (cell_index == 2){
								obj.constituency = cell_text;
							} else if (cell_index == 3){
								obj.party = cell_text;
							}

						});

						request(obj.url, function(error, response, body){

							if (!error && response.statusCode == 200){
								
								var $ = cheerio.load(body);

								// get if they won
								var name_text = $(".main-title").text().trim();
								obj.winner = name_text.indexOf("(Winner)") != -1 ? true: false;

								// more info
								var columns0 = ["party", "so_do", "age", "address", "email", "phone"]
								$(".grid_2.alpha").each(function(i, d){
									
									if (i !== 0){									
										obj[columns0[i]] = $(d).text().split(":")[1].trim();
	
										// age is a number
										if (i == 2){
											obj[columns0[i]] = +obj[columns0[i]];
										}
									}

								});

								// profession
								$("p").each(function(i, d){
									if (i == 0){
										var profession_split = $(d).html().split(":");
										
										obj.profession = profession_split[1] ? profession_split[1].split("<br")[0].split(">")[1] : "";
										obj.spouse_profession = profession_split[2] ? profession_split[2].replace(/\n/g, "").replace("</b>", "") : "";
									}

								});

								var pct = (row_index + 1) / rows.length * 100;
								console.log(pct.toFixed(2) + "%");

								data.push(obj);

								// don't write till the end
								if (pct > 90) io.writeDataSync("data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidate-details.csv", data);	
								
							} else {
								console.log("Error scraping " + obj.url);
							}

						});

					}
					
				}

			});

		} else {
			console.log("Error in request", error);
		}
	});

}