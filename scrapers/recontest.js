var request = require("request"),
  cheerio = require("cheerio"),
  prompt = require("prompt"),
  io = require("indian-ocean"),
  jz = require("jeezy"),
  select = require("../helpers/select_election.js");

select.select(object => {
  var state = object.state,
    year = object.year,
    id = object.id;

  var candidates = io.readDataSync("data/" + jz.str.toSlugCase(state) + "_" + year + "_candidates.csv");

  var lookup_keys = Object.keys(candidates[0]).filter(key => key != "candidate_name" && key != "assets" && key != "liabilities" && key != "net_assets")

  var url = makeUrl(id);
  
  makeRequest();
  // make it a separate function so it's easy to comment out
  function makeRequest(){
    console.log("Requesting recontesting candidates from " + state + " for the " + year + " election...");
    request(url, function(error, response, body){
      if (!error && response.statusCode == 200){
        var $ = cheerio.load(body);
        var arr = [];

        var rows = $(".divTableWithFloatingHeader").find("tr");

        rows.each(function(i, d){

          if (i >= 2 && i != rows.length - 1){
            var obj = {};

            var info = url.split("/")[3];
            
            $(d).find("td").each(function(i, c){

              if (i == 1){
                obj.candidate_name = $(c).text().split("(")[0].trim();
                obj.party = $(c).text().split("(")[1].replace(")","").trim();
                obj.url_comparison = $(c).find("a").attr("href");
                obj.url_candidate = "http://myneta.info/" + id + "/candidate.php?candidate_id=" + obj.url_comparison.split("&id1=")[1].split("&")[0];
              } else if (i == 2){
                obj.assets_this = +jz.str.replaceAll($(c).text().split("  ")[0],",","");
              } else if (i == 3){
                obj.assets_last = +jz.str.replaceAll($(c).text().split("  ")[0],",","");
              } else if (i == 4){
                obj.assets_change = +jz.str.replaceAll($(c).text().split("  ")[0],",","");
              } else if (i == 5){
                obj.assets_change_pct = $(c).text();
              } else if (i == 6){
                obj.remarks = $(c).text().trim();
              }

            });

            var lookup = candidates.filter(candidate => candidate.candidate_name == obj.candidate_name && candidate.party == obj.party)[0];
            lookup_keys.forEach(key => {
              obj[key] = lookup[key];
            });
            
            arr.push(obj);

          }

        });

        io.writeDataSync("data/" + jz.str.toSlugCase(state) + "_" + year + "_recontesting.csv", arr); // write the file

      } else {
        console.log("Error!");
        console.log(error);
      }
    });
  }

})

function makeUrl(id){
  return "http://myneta.info/" + id + "/index.php?action=recontestAssetsComparison"
}