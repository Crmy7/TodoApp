const mysql = require('mysql');
const pool = mysql.createPool({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: '8889',
});
/**
 * Fonction utilitaire permettant de faire une requête
 * 
 * Arguments: 
 *   query : Chaîne de caractères d'une requête SQL
 *   callback : Fonction de rappel qui sera appelée avec le résultat de la requête en cas de succès
 * 
 * Attention ! En cas d'erreur une exception sera levée, il faut entourer les appels à cette fonction par un try/except
 * try {
 *     sqlQuery(....)
 * } except {
 *     // Gestion de l'erreur ici
 * }
 */
function sqlQuery(query, callback) {
    pool.getConnection((connError, connection) => {
        if (connError) {
            console.log(connError);
            throw new Error("Connection error " + connError);
        }
        try {
            connection.query(query, (error, result) => {
                if (error) {
                    console.log(error);
                    throw new Error("Query error " + error);
                }

                callback(result);
            });
        } catch (error) {
            throw new Error("Unexpected error occured : " + error);
        }
        connection.release();
    });
}

try {
    sqlQuery("SELECT * FROM todo", (results) => {
        // console.log(results);
    })
} catch (error) {
    console.log(error);
};

module.exports = sqlQuery;