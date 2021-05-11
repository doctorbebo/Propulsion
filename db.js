const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

console.log('connection created to db');

const QueryDatabase = async (queryString, escapedValueArray = []) => {
    try {
        let results = await pool.query(queryString, escapedValueArray);
        return results = results[0].length === 1 ? results[0][0] : results[0];
    } catch(err) {
        throw err;
    }
}

const Get = async (table, key, value, table_column = '*') => {
    try {
        if(!table || !key || !value) throw new Error ('table, key and value must be used to access database via get');
        const user = await QueryDatabase(`SELECT ${table_column} FROM ${table} WHERE ${key} = ?`, [value]);
        if(user.length === 0)
            return undefined;
        return user;
    } catch(err) {
        throw err;
    }

}

const GetAll = async (table, table_column = '*') =>
{
    if(!table) throw 'table must be used to access database';
    return await QueryDatabase(`SELECT ${table_column} FROM ${table}`);
}

const Create = async (table, objectToCreate) => {

    if(typeof objectToCreate !== 'object' || objectToCreate == null ||!table)
        throw '"objectToCreate" must be a object and table must be a valid string';

    let queryString = `INSERT INTO ${table} (`
    let valuesString = ') VALUES ('

    const keys = Object.keys(objectToCreate)
    const values = Object.values(objectToCreate);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = String(values[i]);
        if(!value) throw 'all object values must be valid';
        
        if(i !== keys.length - 1) {
            queryString += `${key}, `;
            valuesString += '?, ';
        } else {
            queryString+= `${key}`
            valuesString += '?);';
        }     
    }
    queryString += valuesString;
    try{
        return await QueryDatabase(queryString, values);
    } catch(err) {throw err;}
}

const Update = async (table, keyArray, valueArray, id) => {
    if(!table || !keyArray || !valueArray || !id) throw 'table, key, value, and id must be valid';
    if(keyArray.length !== valueArray.length || valueArray.length <= 0 || keyArray.length <= 0 || (typeof keyArray === 'string' ||  keyArray instanceof String)) 
        throw 'key array and value array must have equal lengths and must be greater than 0';

    let queryString = `UPDATE ${table} SET `;

    for (let i = 0; i < keyArray.length; i++) {
        const key = keyArray[i];
        if(key == 'id')
            return `cannot update id of table ${table}`

        if(i !== keyArray.length -1)
            queryString += `${key} = ?, `;
        else 
            queryString += `${key} = ?`;
    }
    queryString += `WHERE id = ${id}`
    return await QueryDatabase(queryString, valueArray);
}

const Delete = async (table, id) => {
    if(!table || !id) throw 'table and id must be valid';
    queryString = `DELETE FROM ${table} WHERE id = ?`;
    return await QueryDatabase(queryString, [id]);
}

module.exports = {
    Create,
    Get,
    GetAll,
    Delete,
    Update 
};