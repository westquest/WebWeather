const API_KEY = 'a27dec4b70b2790c1b457b039a45cfe9'
const fetch = require('node-fetch')
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
let sqlite3 = require('sqlite3').verbose()
let db = new sqlite3.Database('./sqlite.db')
let a = []

app.get('/weather/city', (req, res) => {
    console.log("Getting weather for name " + req.query.cityName)
    res.set('Access-Control-Allow-Origin', '*');
    getWeatherByCityName(req.query.cityName).then(r => {
        res.send(r)
    })
})

app.get('/weather/coordinates', (req, res) => {
    console.log("Getting weather for coords " + req.query.lat + " ; " + req.query.long)
    res.set('Access-Control-Allow-Origin', '*')
    getWeatherByCoordinates(req.query.lat, req.query.long).then(r => {
        res.send(r)
    })
})

app.route('/favorites')
    .post((req, res) => {
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS, POST')
        res.set('Access-Control-Allow-Headers', 'Content-Type')
        res.set('Access-Control-Allow-Origin', req.headers.origin)
        res.set('Access-Control-Allow-Credentials', 'true')

        const stmt = db.prepare(`INSERT INTO favoriteCities VALUES (?)`)
        stmt.run([req.query.cityName], (err, rows) => {
            if (!err) {
                res.sendStatus(200)
                console.log('Added to favorite: ' + a)
            } else {
                res.sendStatus(500)
                console.log('Error while adding to favorite: ' + a)
            }
        })
        stmt.finalize()
    })
    .get((req, res) => {
        res.set('Access-Control-Allow-Credentials', 'true')
        res.set('Access-Control-Allow-Origin', req.headers.origin)
        console.log('Getting favorites: ' + a)

        const stmt = db.prepare(`SELECT city_name FROM favoriteCities`)

        stmt.all(name, (err, rows) => {
            if (!err) {
                res.json(rows.map(r => r['city_name']))
            } else {
                res.sendStatus(500)
            }
        })
        stmt.finalize()
    })
    .delete((req, res) => {
        res.set('Access-Control-Allow-Methods', 'DELETE');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Allow-Origin', req.headers.origin);
        res.set('Access-Control-Allow-Credentials', 'true');

        const stmt = db.prepare(`DELETE FROM favoriteCities WHERE city_name = ?`)
        stmt.run([req.query.cityName], (err, rows) => {
            if (!err) {
                res.sendStatus(200)
                console.log('Deleted from favorite: ' + a)
            } else {
                res.sendStatus(500)
                console.log('Error while deleting from favorite: ' + a)
            }
        })
        stmt.finalize()
    })

async function getWeatherByCityName(name) {
    console.log("Before ot weather for name " + name)
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&q=${name}&appid=${API_KEY}`)
    console.log("Got weather for name " + name)

    return res.json()
}

async function getWeatherByCoordinates(lat, lon) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    return res.json()
}




/*app.get('/bd', (req, res) => {

    db.serialize(function() {

        db.run('CREATE TABLE cities (city_name TEXT)');
        let stmt = db.prepare('INSERT INTO cities VALUES (?)');

        for (let i = 0; i < 10; i++) {
            stmt.run('Ipsum ' + i);
        }

        stmt.finalize();

        db.each('SELECT * FROM cities', function(err, row) {
            console.log(row);
        });
    });

    db.close();
})*/



db.run('CREATE TABLE IF NOT EXISTS favoriteCities (city_name TEXT)')

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.use(cors());









