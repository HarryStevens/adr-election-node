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
node scrapers/index.js # get details of all candidates for an election
```

### Processors
After you've run the scrapers, you can run the processors. These are not necessary, but they are useful if you want to match this data with other datasets.
```bash
node processors/ac_nos.js # add assembly constituency numbers (and any other properties you like) from a lookup table, which can be found in meta_data/constituency_lookup. see #2 below.
node processors/partify.js # get party full names (all the parties need to be added to party-time first)
```

## Add an election
1. Add the appropriate object to `meta_data/elections.js`. It must include the state name, election year, and the id from the election's myneta.info URL.
2. Unfortunately, myneta.info uses the wrong constituency ids, so you need to make a lookup file and add it to `meta_data/constituency_lookup/` in order to run . It must be a javascript file. Its name must match the id from the elections's myneta.info URL. Your lookup table will be an array of objects where each object represents an assembly constituency and has the properties `constituency`, `district`, and `ac_no`. It can have additional properties such as `reservations` and `sub_region`. To see an example of a lookup file, [see this](https://github.com/HindustanTimesLabs/adr-election-node/blob/master/meta_data/constituency_lookup/HimachalPradesh2017.js). You can usually get the rest of the information required from [Lok Dhaba](http://lokdhaba.ashoka.edu.in/LokDhaba-Shiny/).