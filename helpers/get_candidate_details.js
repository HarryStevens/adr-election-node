var io = require("indian-ocean"),
  _ = require("underscore"),
  request = require("request"),
  cheerio = require("cheerio"),
  jz = require("jeezy"),
  fsz = require("fsz")

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

var indexes_scraped = []; // once we scrape all the indexes, we can call the callback.

module.exports.go = function(object, callback){
  var data = [];

  var state = object.state,
    year = object.year,
    id = object.id;

  fsz.mkdirIf(jz.str.toSlugCase(state), "data");
  fsz.mkdirIf(year, "data/" + jz.str.toSlugCase(state));

  console.log("Scraping candidate details from the " + year + " " + state + " election.");

  request("http://myneta.info/" + id + "/index.php?action=summary&subAction=candidates_analyzed&sort=candidate", function(error, response, body){
    if (!error && response.statusCode == 200){

      var $ = cheerio.load(body);

      $("table").each(function(table_index, table){

        if (table_index == object.table_index){

          var rows = $(table).find("tr");

          console.log("Rows: ", rows.length);

          var scrape_row_limited = _.rateLimit(scrape_row, 500);

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
              
              if (cell_index == 1) {
                obj.candidate_name = cell_text;
                obj.url = "http://myneta.info/" + id + "/" + $(cell).find("a").attr("href");
              } else if (cell_index == 2){
                obj.constituency = cell_text;
              } else if (cell_index == 3){
                obj.party = cell_text;
              } else if (cell_index == 4){
                obj.criminal_cases = cell_text;
              } else if (cell_index == 5){
                obj.education = cell_text;
              } else if (cell_index == 6){
                obj.assets = getNumberFromCol(cell_text);
              } else if (cell_index == 7){
                obj.liabilities = getNumberFromCol(cell_text);
              }

            });

            obj.net_assets = obj.assets - obj.liabilities;

            request(obj.url, function(error, response, body){

              if (!error && response.statusCode == 200){
                
                var $ = cheerio.load(body);

                // get if they won
                var name_text = $(".main-title").text().trim();
                obj.winner = name_text.indexOf("(Winner)") != -1 ? true : false;

                obj.district = $("#main > div > div.items > a:nth-child(3)").text().trim();

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
                indexes_scraped.push(row_index);

                // don't write till the end
                if (row_index == rows.length - 1) {

                  console.log("Got to last candidate. Checking if all candidates have been scraped...");
                  var interval = setInterval(function(){

                    var done = jz.arr.sortNumbers(indexes_scraped).every(function(d, i){
                      return i !== 0 ? d - indexes_scraped[i - 1] == 1 : i == 0;
                    });
                    
                    if (done){
                      console.log("All candidates have been scraped.");
                      clearInterval(interval);
                      io.writeDataSync("data/" + jz.str.toSlugCase(state) + "/" + year + "/" + jz.str.toSlugCase(state) + "_" + year + "_candidate-details.csv", data);
                      callback(object);
                    } else {
                      console.log("All candidates have not been scraped yet. Checking again in 3 seconds...");
                    }

                  }, 3000);
                  
                }
                
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

function getNumberFromCol(txt){
  return txt == "Nil" ? 0 : +jz.str.replaceAll(txt.split("Rs")[1].split(" ~")[0], ",", "").trim();
}