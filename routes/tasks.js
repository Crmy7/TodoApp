var express = require('express');
var router = express.Router();
const mysql = require("mysql");
const sqlQuery = require("../mysql/mysql");
const middlewares = require("../middlewares");
const sequelize = require("../utils/sequelize");

router.use(middlewares.authentificationMiddleware);

const tasks = [
    {
        id: 1,
        title: 'Task 1',
        creation_date: '2023-09-26T11:49:09.985Z',
        due_date: '2023-09-27T11:49:09.985Z',
        done: false,
        description: 'une petite description',
        user: 'user 1',
    },
    {
        id: 2,
        title: 'Task 2',
        creation_date: '2023-09-26T11:49:09.985Z',
        due_date: '2023-09-27T11:49:09.985Z',
        done: false,
        description: 'une petite description',
        user: 'user 2',
    },
    {
        id: 3,
        title: 'Task 3',
        creation_date: '2023-09-26T11:49:09.985Z',
        due_date: '2023-09-27T11:49:09.985Z',
        done: false,
        description: 'une petite description',
        user: 'user 3',
    },
];

/* GET home page. */
// router.get('/', function (req, res, next) {

//     sqlQuery("SELECT title, user, description FROM todo", (results) => {
//         console.log(results);
//         const dataTasks = results.map(task => ({
//             title: task.title,
//             user: task.user,
//             description: task.description,
//         }));

//         res.json(dataTasks);
//     });
// });

router.get('/:id', function (req, res, next) {
    const id = parseInt(req.params.id);

    // Exécutez une requête SQL pour récupérer la tâche correspondant à l'ID
    sqlQuery(`SELECT * FROM todo WHERE id = ${id}`, (results) => {
        if (results.length === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        const task = results[0];
        res.json(task);
    });
});

// router.post('/', (req, res) => {
//     const newTask = req.body;

//     const newId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
//     newTask.id = newId;
//     tasks.push(newTask);
//     res.status(201).json(newTask);
// });

router.post('/', (req, res) => {
    const newTask = req.body;
    const values = [
        newTask.title,
        newTask.creation_date,
        newTask.due_date,
        false,
        newTask.user,
        newTask.description
    ];

    const sql = "INSERT INTO todo (title, creation_date, due_date, done, description, user) VALUES (?, ?, ?, ?, ?, ?)";

    const query = mysql.format(sql, values);

    try {
        sqlQuery(query, (result) => {
            const insertedTask = {
                id: result.insertId,
                ...newTask,
                done: false,
            };

            // console.log(insertedTask);
            res.json(insertedTask);
        });
    } catch (error) {
        console.log("Erreur lors de l'insertion de la tâche dans la base de données:", error);
        res.json({ error: "Erreur lors de la création de la tâche" });
    }
});

// router.patch('/:id', function (req, res) {
//     const id = parseInt(req.params.id);
//     const updatedTask = req.body;

//     const taskToUpdate = tasks.find(task => task.id === id);

//     if (!taskToUpdate) {
//         return res.status(404).json({ message: 'Tâche non trouvée' });
//     }

//     for (const key in updatedTask) {
//         if (key in taskToUpdate) {
//             taskToUpdate[key] = updatedTask[key];
//         }
//     }

//     res.json(taskToUpdate);
// });


router.patch('/:id', function (req, res) {
    const id = parseInt(req.params.id);
    const updatedTask = req.body;

    const updateFields = Object.keys(updatedTask).map(key => `${key} = '${updatedTask[key]}'`);

    const sql = `UPDATE todo SET ${updateFields.join(', ')} WHERE id = ${id}`;

    sqlQuery(sql, (result) => {
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        res.json(updatedTask);
    });
});


/* Delete un todo */


router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    sqlQuery(`SELECT * FROM todo WHERE id = ${id}`, (results) => {
        if (results.length === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        sqlQuery(`DELETE FROM todo WHERE id = ${id}`, (result) => {
            if (result.affectedRows === 1) {
                res.json({ message: 'Tâche supprimée avec succès' });
            } else {
                res.status(500).json({ message: 'Erreur lors de la suppression de la tâche' });
            }
        });
    });
});


router.get('/', function (req, res, next) {
    const taskToShow = 5;
    const page = req.query.page || 1;
    const order = req.query.order || "ASC";
    const done = req.query.done;
    const search = req.query.search;
    const user = req.query.user;
    const userId = req.user.id;
    const offset = (page - 1) * taskToShow;

    let whereClauses = [];

    if (done === "yes") {
        whereClauses.push("done = 1");
    } else if (done === "no") {
        whereClauses.push("done = 0");
    }

    if (search) {
        whereClauses.push(`title LIKE '%${search}%'`);
    }

    if (user) {
        whereClauses.push(`user LIKE '%${user}%'`);
    }

    const whereClause = whereClauses.length > 0 ? whereClauses.join(' AND ') : "1=1";

    const querySql = `SELECT title, user, description, done, due_date FROM todo WHERE ${whereClause} AND user_id= ${userId} ORDER BY due_date ${order} LIMIT ${taskToShow} OFFSET ${offset}`;

    sqlQuery(querySql, (result) => {
        const countQuerySql = `SELECT COUNT(*) as count FROM todo WHERE ${whereClause}`;
        sqlQuery(countQuerySql, (countResult) => {
            const count = countResult[0].count;

            const hasPrev = page > 1;
            const hasNext = (page - 1) * taskToShow + result.length < count;
            console.log(result);
            res.json({
                tasks: result,
                userId,
                pagination: {
                    count,
                    page,
                    taskToShow,
                    offset,
                    hasPrev,
                    hasNext,
                },
            });
        });
    });
});

module.exports = router;
