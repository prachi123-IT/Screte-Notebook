const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // use to secure password from hacker
var jwt = require('jsonwebtoken'); //use to check the user only login or any other perso 
var fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = "Prachixyztannuqrst"

//route1-create a user using :POST
router.post('/', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password must be atleast 5 character').isLength({ min: 5 }),
], async (req, res) => {
    let Success=false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({Success, error: "Sorry a user with this email already exist" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt)
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        // .then(user => res.json(user))
        //     .catch(err => { console.log(err) })
        // res.json({ error: 'Please enter a unique value for email', message: err.message })
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        Success=true
        res.json({Success, authtoken })
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured")
    }
})

//route2-create login
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password must be correct').exists(),
], async (req, res) => {
    let Success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ Success, error: "Please try to login with correct credentails" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ Success, error: "Please try to login with correct credentails" });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        Success = true;
        res.json({ Success, authtoken })
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

//route3
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})
module.exports = router 