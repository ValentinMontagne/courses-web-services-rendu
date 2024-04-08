import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 8000;


app.get("/f2p-games/:id", async (req, res) =>{
    const id = req.params.id;
    try {
        const response = await fetch(`https://www.freetogame.com/api/game?id=${id}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Erreur lors de la récupération du jeux :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
})
app.get("/f2p-games", async (req, res) =>{
    let param = "?";

    for (const key in req.query) {
        if (req.query.hasOwnProperty(key)) {
            param += `${key}=${req.query[key]}&`;
        }
    }

    param = param.slice(0, -1);
    console.log(param)
    const url = `https://www.freetogame.com/api/games${param}`
    console.log(url)
    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Erreur lors de la récupération du jeux :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});