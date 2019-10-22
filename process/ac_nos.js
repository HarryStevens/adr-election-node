var io = require("indian-ocean"),
  jz = require("jeezy"),
  fs = require("fs"),
  prompt = require("prompt");

var select = require("../helpers/select_election.js");

select.select(obj => {
  var path = "data/" + jz.str.toSlugCase(obj.state) + "/" + obj.year;
  var files = fs.readdirSync(path).filter(d => d !== ".DS_Store");

  if (files.length == 0){
    console.log("No files in " + path);
    process.exit();
  } else if (files.length == 1){
    var schema = {
      properties: {
        no_district_match: {
          required: true,
          default: "Y",
          message: "Does every constituency have a different name? (Y/n)"
        }
      }
    }

    prompt.start();

    prompt.get(schema, (err, res) => {
      if (err) throw err;
      doit(files[0], res.no_district_match);
    });

  } else {
    var schema = {
      properties: {
        filename: {
          required: true,
          message: "What is the file name? Your options are:\n" + files.join("\n")
        },
        no_district_match: {
          required: true,
          default: "Y",
          message: "Does every constituency have a different name? (Y/n)"
        }
      }
    }

    prompt.start();

    prompt.get(schema, (err, res) => {
      if (err) throw err;
      doit(res.filename, res.no_district_match);
    });    
  }

  function doit(filename, no_district_match){
    if (files.indexOf(filename) == -1) {
      console.log("That file doesn't exist. Try again.");
      process.exit();
    }

    if (no_district_match.toUpperCase() !== "Y" && no_district_match.toUpperCase() !== "N"){
      console.log("You must enter either Y or N for the matching question.");
      process.exit();
    }

    var data = io.readDataSync(path + "/" + filename);
    var lookup = require("../meta_data/constituency_lookup/" + obj.id);
    var cols = Object.keys(lookup[0]);
    data.forEach(d => {
      var m = [];
      if (no_district_match.toUpperCase() == "N"){
        m = lookup.filter(f => f.constituency == d.constituency && f.district == d.district)[0];  
      } else {
        m = lookup.filter(f => f.constituency == d.constituency)[0];  
      }
      if (m == undefined) {
        console.log("ERROR: " + d.constituency + " constituency is missing from your lookup table! Add it and try again.");
        process.exit();
      }
      cols.forEach(c => {
        d[c] = m[c];
      });
      return d;
    });
    console.log(path + "/" + filename + " now has the constituency numbers.");

    // format the final thing
    var cols = ["state", "year", "constituency", "ac_no", "district", "sub_region", "reservations", "candidate_name", "party", "party_eci", "url", "winner", "gender", "age", "so_do", "address", "profession", "spouse_profession", "criminal_cases", "serious_criminal_cases", "education", "assets", "liabilities", "net_assets", "filed_itr", "declared_pan", "recontest_url", "recontest_assets_this", "recontest_assets_last", "recontest_assets_change", "recontest_remarks"];
    var out = data.map(d => {
      var obj = {};
      cols.forEach(col => {
        obj[col] = d[col];
      });
      return obj;
    });
    io.writeDataSync(path + "/" + filename, data);
  }

});