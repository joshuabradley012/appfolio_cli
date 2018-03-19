# AppFolio Listing Search Tool

## Installation

Before you can use the tool, you'll need to [install node](https://nodejs.org/).

Ensure it is installed with these commands:

    node -v
    npm -v
    
Then you'll want to install the dependencies needed for the tool. Open a command line and navigate to the search tool, then run `npm install` to download the dependencies:

    cd ~/Downloads/appfolio_search
    npm install

When complete, the tool should be ready to use. Note that the node_modules folder that was created should not be removed.

## Usage

You can search through multiple domains in bulk and can customize your search string. Keep in mind this is a very rigid search; it searches for your input exactly (case insensitive). A difference like 'section' vs 'sections' will return different results. So you may need to run several variations to be thorough, and recommend keeping your searches as simple as possible.

When the search is complete, a csv file will be downloaded to the tool's with the information for all of the matched listings.

Open a command line and navigate to the search tool in order to run commands:

    cd ~/Downloads/appfolio_search

### Syntax

    node search.js [search] [subdomain1, ...]
    
**\[search]** is the string you want to check listings for, it should be wrapped in apostrophes:

    node search.js 'apartment' [subdomain1, ...]
    node search.js 'cats allowed' [subdomain1, ...]
    node search.js 'section 8' [subdomain1, ...]

**\[subdomain1, ...]** is the list of appfolio domains that you want to search. These should not be the full domain, only the subdomain. So if the website is https://realestate.appfolio.com, your command should use `realestate`:

    node search.js [search] realestate

Subdomains can be searched in bulk, so if you wanted to search through https://larealestate.com, https://realtygroup.com, and https://betterrealtor.com, this would be your command:

    node search.js [search]  larealestate realtygroup betterrealtor

### Examples

    node search.js 'section 8' solarentals rayrobertsrentals
    node search.js 'rent' rohcs