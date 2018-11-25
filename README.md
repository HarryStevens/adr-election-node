# adr-election-node
Scrape data about an election from ADR.

## Setup
```bash
git clone https://github.com/HindustanTimesLabs/adr-election-node
cd adr-election-node
npm install
```

## Usage
### Scrape
```bash
node scrape # get details of all candidates for an election
```

### Process
After you've run the scraper, you can run the processors. These are not necessary, but they are useful if you want to match this data with other datasets.
```bash
node process/ac_nos.js # add assembly constituency numbers (and any other properties you like) from a lookup table, which can be found in meta_data/constituency_lookup. see "Make a constituency lookup" below.
node process/partify.js # get party full names (all the parties need to be added to party-time first)
```

## Add an election
Add the appropriate object to `meta_data/elections.js`. It must include the state name, election year, and the id from the election's myneta.info URL. For instance, if the URL is `myneta.info/mah2004/`, the id is `mah2004`.

## Make a constituency lookup
Unfortunately, myneta.info uses the wrong constituency IDs. If you want to cross reference the ADR data with other data – say, from the Election Commission – you will need the constituency IDs, because the constituency names often appear with different spellings in different datasets. 

You can run `node process/ac_nos.js` to add constituency IDs to the ADR data. But before you can do that, you need to make a lookup file and add it to `meta_data/constituency_lookup/`. It must be a javascript file. Its name must match the id from the elections's myneta.info URL. It must be an array of objects where each object represents an assembly constituency and has the properties `constituency` and `ac_no`. It can have additional properties such as `district`, `reservations` and `sub_region`. To see an example of a lookup file, [see this](https://github.com/HindustanTimesLabs/adr-election-node/blob/master/meta_data/constituency_lookup/HimachalPradesh2017.js).

## Add full party names
You can also run `node process/partify.js` to add a column called `party_eci` to the data, which contains the full party name used by the Election Commission. This script uses [party-time](https://github.com/HindustanTimesLabs/party-time) to match the party abbreviations from ADR with the full party names. It is possible that party-time will not already have all of the abbreviations you need in its database. To find out, run the partify script on your file, check the output, and see if any of the parties in the `party_eci` column are still abbreviations. If they are, you'll need to add them to [party-time's parties database](https://github.com/HindustanTimesLabs/party-time/blob/master/src/data/parties.json).