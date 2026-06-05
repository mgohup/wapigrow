const Datastore = require('nedb-promises');
const path      = require('path');
const fs        = require('fs');

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '../../data');

fs.mkdirSync(dbPath, { recursive: true });

const store = (name) =>
  Datastore.create({ filename: path.join(dbPath, `${name}.db`), autoload: true });

const db = {
  users:       store('users'),
  contacts:    store('contacts'),
  campaigns:   store('campaigns'),
  automations: store('automations'),
  messages:    store('messages'),
  settings:    store('settings'),
  activity:    store('activity'),
};

module.exports = db;
