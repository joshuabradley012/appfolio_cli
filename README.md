# AppFolio Listing Search Tool

## Installation

Download a ZIP file and open it on your desktop or install GitHub and clone the repo:

    sudo apt-get install git
    cd ~/Applications
    git clone git@github.com:joshuabradley012/appfolio_search.git

**Note:** `~/Applications` is an example, you can save the folder anywhere.

### Node

Node is required [install node](https://nodejs.org/):

    curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
    sudo apt-get install -y nodejs

Ensure it is installed with these commands:

    node -v
    npm -v
    
Install the dependencies:

    cd ~/Applications/appfolio_search
    npm install

When complete, the tool should be ready to use. Note that the `node_modules` folder should not be removed.

## Usage

You can search through multiple domains in bulk and can customize your search string or search with [regex](http://www.regular-expressions.info/). Keep in mind this is a very rigid search; it searches for your input exactly (case insensitive). A difference like 'section' vs 'sections' will return different results. So you may need to run several variations to be thorough, and recommend keeping your searches as simple as possible. When the search is complete, a .csv file will be downloaded to the tool's with the information for all of the matched listings.

Open a command line and navigate to the search tool in order to run commands:

    cd ~/Applications/appfolio_search

### Syntax

    node search.js [search] [subdomain1, ...]
    
**\[search]** is the string you want to check listings for, it should be wrapped in quotes:

    node search.js 'apartment' [subdomain1, ...]
    node search.js 'cats allowed' [subdomain1, ...]
    node search.js 'section 8' [subdomain1, ...]

**\[subdomain1, ...]** is the list of appfolio domains that you want to search. This should not be the full domain, only the subdomain. So if the website is https://realestate.appfolio.com, your command should use `realestate`:

    node search.js [search] realestate

Subdomains can be searched in bulk, eg https://larealestate.appfolio.com, https://realtygroup.appfolio.com, and https://betterrealtor.appfolio.com:

    node search.js [search] larealestate realtygroup betterrealtor

### Examples

    node search.js 'section 8' solarentals rayrobertsrentals
    node search.js 'rent' rohcs
    node search.js 'dogs allowed' rohcs solarentals rayrobertsrentals
