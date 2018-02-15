# adr-election-node
Scrape data about an election from ADR (similar to adr-data but in Node)

## Setup
```bash
git clone https://github.com/HindustanTimesLabs/adr-election-node
cd adr-election-node
npm install
```

## Usage
### Scrapers
```bash
node scrapers/index.js # get all candidates for an election
node scrapers/candidate_details.js # more details about the candidates. this takes a lot longer to run because it has to make a separate request for each candidate.
```

### Processors
After you've run the scrapers, you can run the processors.
```bash
node processors/merge_details.js # merge the candidates.csv with with candidate-details.csv into a MASTER.csv
node processors/partify.js # get party full names (all the parties need to be added to party-time first)
```

## Add an election
1. Add the appropriate object to `meta_data/elections.js`. It must include the state name, election year, and the id from the election's myneta.info URL.
2. Unfortunately, myneta.info uses the wrong constituency ids, so you need to make a lookup file and add it to `meta_data/constituency_lookup/`. It must be a javascript file. Its name must match the id from the elections's myneta.info URL. Your lookup table will be an array of objects where each object represents an assembly constituency and has the properties `constituency` and `ac_no`. It can have additional properties such as `reservations`, `district`, and `sub_region`. To see an example of a lookup file, [see this](https://github.com/HindustanTimesLabs/adr-election-node/blob/master/meta_data/constituency_lookup/HimachalPradesh2017.js).