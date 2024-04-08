const express = require("express");
const router = express.Router();

router.get("/:id", async (req, res) => {
    try {
        const gameId = req.params.id;
        import('node-fetch').then(async fetch => {
            const response = await fetch.default(`https://www.freetogame.com/api/game?id=${gameId}`);

            if (!response.ok) {
                throw new Error('pas de jeu avec cet Id');
            }
    
            const gameData = await response.json();
            res.json(gameData);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;