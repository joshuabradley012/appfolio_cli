# AppFolio Listing Search Tool

## Installation

Before you can use the tool, you'll need to [install node](https://nodejs.org/).

Ensure it is installed with these commands:

    node -v
    npm -v
    
Then you'll want to install the dependencies needed for the tool. Open a command line and navigate to the search tool, then run `npm install` to download the dependencies.

    cd ~/Downloads/appfolio_search
    npm install

When complete, the tool should be ready to use. Note that the node_modules folder that was created should not be removed.

## Usage

You can search through multiple domains in bulk and can customize your search string. Keep in mind this is a very rigid search; it searches for your input exactly (case insensitive). A difference like 'section' vs 'sections' will return different results. So you may need to run several variations to be thorough.

Open a command line and navigate to the search tool in order to run commands:

    cd ~/Downloads/appfolio_search

### Syntax
Basic syntax:

    node search.js [search] [domain1, ...]
    
*\[search]* is the string you want to check listings for. If this is more than one word, it should be wrapped in apostrophes:

    node search.js section solarentals
    node search.js 'section 8 housing' solarentals

*\[domain1, ...]*