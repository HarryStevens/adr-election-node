var select = require("../helpers/select_election"),
  candidates = require("../helpers/get_candidate_details"),
  itr = require("../helpers/get_itr"),
  no_pan = require("../helpers/get_no_pan"),
  serious_cases = require("../helpers/get_serious_cases"),
  women = require("../helpers/get_women"),
  recontest = require("../helpers/get_recontest"),
  makeLookup = require("../helpers/make_lookup");

select.select(obj => {
  candidates.go(obj, obj => {
    itr.go(obj, obj => {
      no_pan.go(obj, obj => {
        serious_cases.go(obj, obj => {
          women.go(obj, obj => {
            recontest.go(obj, obj => {
              makeLookup.go(obj);
            });
          });
        });
      });
    });
  });
});