/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const DB_NAME = "Glean";

class Store {
    constructor() {
        // Initialize the database.
        this._executeQuery(`CREATE TABLE IF NOT EXISTS ${DB_NAME}(key TEXT, value TEXT);`);

        // For debugging purposes: clear the db on init.
        // _executeQuery(`DELETE FROM ${DB_NAME};`);

        // This allows for `REPLACE ITEM` to work.
        // See: https://www.sqlitetutorial.net/sqlite-replace-statement/
        this._executeQuery(`CREATE UNIQUE INDEX IF NOT EXISTS idx ON ${DB_NAME}(key);`)
    }

    _getDbHandle() {
        return LocalStorage.openDatabaseSync(DB_NAME, "1.0", `${DB_NAME} Storage`, 1000000);
    }

    _executeQuery(query) {
        const handle = this._getDbHandle();
        console.info(`Attempting to execute query: ${query}`);
    
        let rs;
        try {
            handle.transaction(tx => {
                rs = tx.executeSql(query);
            })
        } catch (err) {
            console.error(`Error executing query! ${err}`);
        }

        return rs;
    }

    getItem(key) {
        let result;
        const rs = this._executeQuery(`SELECT key, value FROM ${DB_NAME} WHERE key='${key}';`);
        if (rs.rows.length === 0) {
            result = null;
        } else if (rs.rows.length > 1) {
            console.error("Duplicate rows in database, something went wrong. Entries:");
            for (let i = 0; i < rs.rows.length; i++) {
                console.info(`key: ${rs.rows.item(i).key}, value: ${rs.rows.item(i).value}`)
            }
            result = null;
        } else {
            result = rs.rows.item(0).value;
        }

        return result;
    }

    setItem(key, value) {
        this._executeQuery(`REPLACE INTO ${DB_NAME}(key, value) VALUES('${key}', '${value}');`);
    }

}

// Store Singleton!
const StoreInstance = new Store();

module.exports = {
    getItem(key) {
        return StoreInstance.getItem(key);
    },

    setItem(key, value) {
        StoreInstance.setItem(key, value);
    }
};

