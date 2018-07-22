const pg = require('pg');
const { Client } = require('pg')


const dbURL = process.env.DATABASE_URL || 'postgres://localhost/wnews';

const client = new Client(dbURL);
client.connect();


module.exports = client;


