module.exports = async (charname, thumbnailurl, fullimageurl, starlevel, ubskill, skill1, skill2, exskill) => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };

    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    console.log(`LOG: Adding ${charname} To The Database`);

    const query = `
        UPDATE CHARDB SET thumbnailurl = '${thumbnailurl}', fullimageurl = '${fullimageurl}', starlevel = ${starlevel}, 
            ubskill = ${ubskill}, skill1 = ${skill1}, skill2 = ${skill2}, exskill = ${exskill}
            WHERE charname = '${charname}';
        INSERT INTO CHARDB (charname, encharname, thumbnailurl, fullimageurl, starlevel, ubskill, skill1, skill2, exskill)
            SELECT '${charname}', '${thumbnailurl}', '${fullimageurl}', ${starlevel}, '${ubskill}', '${skill1}', '${skill2}', '${exskill}'
            WHERE NOT EXISTS (SELECT 1 FROM CHARDB WHERE charname = '${charname}');
    `;

    try {
        const res = await pgdb.query(query);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}