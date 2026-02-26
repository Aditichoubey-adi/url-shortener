const express = require('express');
const { nanoid } = require('nanoid');
const Datastore = require('nedb-promises');

const app = express();
const db = Datastore.create('urls.db');
app.use(express.json());
app.use(express.static('public'));

app.post('/shorten', async (req, res) => {
    const { longUrl } = req.body;
    const shortId = nanoid(6);
    await db.insert({ shortId, longUrl, clicks: 0 });
    res.json({ shortUrl: `http://localhost:3000/${shortId}`, shortId });
});
// Saare links ek saath dekhne ke liye
app.get('/all-links', async (req, res) => {
    const links = await db.find({});
    res.json(links);
});
app.get('/analytics/:shortId', async (req, res) => {
    const entry = await db.findOne({ shortId: req.params.shortId });
    if (entry) res.json(entry);
    else res.status(404).json({ error: "Not found" });
});

app.get('/:shortId', async (req, res) => {
    const entry = await db.findOne({ shortId: req.params.shortId });
    if (entry) {
        await db.update({ shortId: entry.shortId }, { $inc: { clicks: 1 } });
        return res.redirect(entry.longUrl);
    }
    res.status(404).send("Link invalid");
});

app.listen(3000, () => console.log("Server ON: http://localhost:3000"));