var express = require('express');
var router = express.Router();
const mysql = require("mysql");
const sqlQuery = require("../mysql/mysql");
const middlewares = require("../middlewares");
const sequelize = require("../utils/sequelize");
const Task = require('../models/task');

router.use(middlewares.authentificationMiddleware);

router.get('/all', function (req, res) {
    Task.findAll().then((tasks) => {
        res.json(tasks);
    });
});

router.get('/all/asynch', async function (req, res) {
    const tasks = await Task.findAll({
        where: {
            user: "Charles",
        }
    })
    res.json(tasks);
});

router.get('/:id', function (req, res, next) {
    const id = parseInt(req.params.id);

    Task.findByPk(id).then((task) => {
        if (task === null) {
            res.status(404);
            res.send("Task not found");
            return;
        }
        res.json(task);
    });
});

// router.patch('/:id', function (req, res, next) {
//     const id = parseInt(req.params.id);
//     Task.findByPk(id).then((task) => {
//         if (task === null) {
//             res.status(404);
//             res.send("Task not found");
//             return;
//         }
//         task.update(req.body).then((updatedTask) => {
//             res.json(updatedTask);
//         });
//     });
// });

router.patch('/:id', async (req, res) => {
    const { title, done, user, description } = req.body;
    // On doit quand même transformer la date en objet JS
    const due_date = req.body.due_date ? new Date(Date.parse(req.body.due_date)) : undefined;

    const task = await Task.findByPk(req.params.id);
    if (!task) {
        res.status(404).send("Task not found");
    } else {
        let body = {
            'title': title,
            'done': done,
            'due_date': due_date,
            'user': user,
            'description': description
        };

        for (let key in body) {
            if (body[key] === undefined) {
                delete body[key];
            }
        }

        try {
            await task.update(body);
            res.json(task);
        } catch (exception) {
            console.error(exception);
            res.status(500).send("Impossible de mettre à jour la tâche");
        }
    }
});

const { Op } = require("sequelize");

router.get('filtered', async function (req, res) {
    const tasks = await Task.findAll({
        where: {
            // done: true,
            [Op.or]: [
                {
                    user: {
                        [Op.like]: '%Charles%',
                    }
                },
                {
                    user: {
                        [Op.like]: '%Abdel%',
                    }
                }
            ]
        },
    });
    res.json(tasks);
});


router.post('/add', async function (req, res) {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.send("Impossible d'ajouter la tâche");
    }
});

router.delete('/:id', function (req, res, next) {
    const id = parseInt(req.params.id);

    Task.findByPk(id).then((task) => {
        if (!task) {
            res.status(404).send("Task not found");
            return;
        }
        task.destroy().then(() => {
            res.send("Task deleted successfully");
        });
    });
});

module.exports = router;