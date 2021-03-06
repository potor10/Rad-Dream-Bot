module.exports = async (id, date, attempt1, attempt2, attempt3, cbid) => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };

    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        UPDATE ATTACKS SET attempt1damage = ${attempt1}, attempt2damage = ${attempt2}, attempt3damage = ${attempt3}, 
            attempt4damage = 0, cbid = ${cbid}
            WHERE uid = '${id}' AND attackDate = '${date}';
        INSERT INTO ATTACKS (uid, attackDate, attempt1damage, attempt2damage, attempt3damage, attempt4damage, cbid)
            SELECT '${id}', '${date}', ${attempt1}, ${attempt2}, ${attempt3}, 0, ${cbid}
            WHERE NOT EXISTS (SELECT 1 FROM ATTACKS WHERE uid = '${id}' AND attackDate = '${date}');
    `;

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: ATTACKS table is successfully updated with values: '${id}', '${date}', ${attempt1}, ${attempt2}, ${attempt3}, 0, ${cbid}`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}