# Book Shelf

Log book and author information, along with ratings and notes on books you have read.

## Table of Contents

1. [Installation](#installation)
2. [Authentication](#authentication)
3. [Usage](#usage)
4. [License](#license)

## Installation

Clone the repository
```bash
git clone https://github.com/geoffm39/book-shelf.git
```

Navigate to the project directory
```bash
cd book-shelf
```

Install dependencies
```bash
npm install
```

If you do not have already, you need to install a postgreSQL management software to setup 
your postgreSQL local server.  The version of postgreSQL used for this app was PostgreSQL 15, and the software
I used was pgAdmin 4.

Once you have the chosen management software installed create a new database.
Open or copy the create-tables.sql query file within a query on the database and run
to create the tables.

## Authentication

You need to provide the environment variables for the database as well as a server port number for the express server.

Create the .env file in the project directory
```bash
touch .env
```

Open the .env file in your editor and add the database and port variables and save
`SERVER_PORT="<YOUR-SERVER-PORT>"`
`DB_PORT="<YOUR-DATABASE-PORT>"`
`DB_PASSWORD="<YOUR-DATABASE-PASSWORD>"`
`DB_DATABASE="<YOUR-DATABASE-NAME>"`
`DB_HOST="<YOUR-DATABASE-HOST>"`
`DB_USER="<YOUR-DATABASE-USERNAME>"`

## Usage

Start the development server
```bash
node index.js
```
or if using nodemon
```bash
nodemon index.js
```

Load the server URL in you browser with your chosen port number.
[http://localhost:<YOUR-SERVER-PORT>/](http://localhost:<YOUR-SERVER-PORT>/)

## License

MIT License