const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator')

//route1
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes)
})

//route2
router.post('/addnotes', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 character').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const saveNotes = await note.save()
        res.json(saveNotes);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }

})

//route3
router.put('/updatenotes/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        let notes = await Notes.findById(req.params.id);
        if (!notes) { return res.status(404).send("Not Found") }
        if (notes.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        notes = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ notes });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

//route4
router.delete('/deletenotes/:id', fetchuser, async (req, res) => {
    try {
        let notes = await Notes.findById(req.params.id);
        if (!notes) { return res.status(404).send("Not Found") }
        if (notes.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        notes = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "success": "Note has been deleted" });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

module.exports = router