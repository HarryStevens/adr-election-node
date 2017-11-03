# adr-election-node
Scrape data about an election from ADR (similar to adr-data but in Node)

## Setup
```bash
git clone https://github.com/HindustanTimesLabs/adr-election-node
cd adr-election-node
npm install
```

## Usage
```bash
node scrapers/candidates.js # get all candidates for an election
node scrapers/women.js # which are women?
node scrapers/itr.js # which filed ITR?
node scrapers/no_pan.js # which didn't declare PAN?
node scrapers/serious_cases.js # which face serious criminal cases?
node scrapers/recontest.js # which candidates are running again? NOTE: You need to run the candidates scraper first
```

After you've run those, you can run these
```bash
node processors/master.js # make a master file
```

## Add An Election
1. Add the appropriate object to `meta_data/elections.js`. It must include the state name, election year, and the id from the election's myneta.info URL.
2. Unfortunately, myneta.info uses the wrong constituency ids, so you need to make a lookup file and add it to `meta_data/constituency_lookup/`. It must be a javascript file. Its name must match the id from the elections's myneta.info URL. Your lookup table will be an array of objects where each object represents an assembly constituency and has the properties `constituency` and `ac_no`. It can have additional properties such as `reservations`, `district`, and `sub_region`. To see an example of a lookup file, [see this](https://github.com/HindustanTimesLabs/adr-election-node/blob/master/meta_data/constituency_lookup/HimachalPradesh2017.js).