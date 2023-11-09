var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/models");
const { Op } = require("sequelize");

function generateToken(id) {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

/* GET home page. */
// router.get('/', function (req, res, next) {
//     res.send({ message: 'Coucou' }); // Vous pouvez également renvoyer une réponse au client si nécessaire
// });

/* GET home page. */
router.get('/', async function (req, res) {
    const users = await User.findAll();
    res.json(users);
});

router.post('/signup', async (req, res) => {
    const body = req.body;

    if (!body.email || !body.password || !body.display_name) {
        res.status(400)
        res.send("Tous les champs sont obligatoires")
        return
    }

    if (body.password.length < 8) {
        res.status(400)
        res.send("MDP doit avoir au moins 8 symboles")
        return
    }

    try {
        const hashedPassword = await bcrypt.hash(body.password, 12);
        const user = await User.create({
            email: body.email,
            password: hashedPassword,
            display_name: body.display_name
        });
        res.status(201)
        res.send("Utilisateur créé");
        res.json(user);
    } catch (exception) {
        res.status(500)
        res.send("Erreur lors de la création : " + exception)
    }
})


router.post('/login', async (req, res) => {
    const body = req.body;

    if (!body.email || !body.password) {
        res.status(400)
        res.send("Tous les champs sont obligatoires")
        return
    }

    try {
        const user = await User.findOne({
            where: {
                email: body.email
            }
        });

        if (!user) {
            res.status(400);
            res.send("Invalid password or email");
            return;
        }

        const isOk = await bcrypt.compare(body.password, user.password);

        if (!isOk) {
            res.status(400);
            res.send("Invalid password or email");
            return;
        }

        delete user.password;

        //Generate a JWT Token
        return res.json({
            'token': generateToken(user.id),
            'user': user,
        });
    } catch (exception) {
        res.status(500)
        res.send("Erreur lors de la connexion : " + exception)
    }
});

router.post('/login', async (req, res) => {
    const body = req.body;

    if (!body.email || !body.password) {
        res.status(400)
        res.send("Tous les champs sont obligatoires")
        return
    }

    try {
        const user = await User.findOne({
            where: {
                email: body.email
            }
        });

        if (!user) {
            res.status(400);
            res.send("Invalid password or email");
            return;
        }

        const isOk = await bcrypt.compare(body.password, user.password);

        if (!isOk) {
            res.status(400);
            res.send("Invalid password or email");
            return;
        }

        //Generate a JWT Token
        return res.json({
            'token': generateToken(user.id),
            'user': user,
        });
    } catch (exception) {
        res.status(500)
        res.send("Erreur lors de la connexion : " + exception)
    }
});

router.get('/test-token', async (req, res) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        jwt.verify(token, secret, async (err, decoded) => {
            console.log(token)
            try {
                const user = await User.findOne({
                    attributes: ['display_name'],
                    where: {
                        id: decoded.id
                    }
                });
                if (!user) {
                    res.status(400);
                    res.send("Invalid password or email");
                }
                if (err) {
                    console.log(err);
                } else {
                    return res.json({
                        'id': decoded,
                        'results': user
                    })
                }
            } catch (exception) {
                res.status(500)
                res.send("Erreur lors de la connexion : " + exception)
            }
        });
    }
});


module.exports = router;
