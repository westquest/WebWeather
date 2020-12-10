const API_KEY = 'a27dec4b70b2790c1b457b039a45cfe9'
const fetch = require('node-fetch')
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
let sqlite3 = require('sqlite3').verbose()
let db = new sqlite3.Database('./sqlite.db')
let a = 200

app.get('/weather/city', (req, res) => {
    console.log("Getting weather for name " + req.query.cityName)
    res.set('Access-Control-Allow-Origin', '*')

    getWeatherByCityName(req.query.cityName).then(r => {
        console.log("STATUS = " + r.toString())
        if (a === 200) {
            res.send(r)
        } else{
            res.sendStatus(404)
        }
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
    .get((req, res) => {
        res.set('Access-Control-Allow-Credentials', 'true')
        res.set('Access-Control-Allow-Origin', req.headers.origin)
        console.log('Getting favorites: ' + a)

        const stmt = db.prepare(`SELECT city_name
                                 FROM favoriteCities`)
        stmt.all((err, rows) => {
            if (!err) {
                res.json(rows.map(r => r['city_name']))
            } else {
                res.sendStatus(500)
            }
        })
        stmt.finalize()
    })
    .post((req, res) => {
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS, POST')
        res.set('Access-Control-Allow-Headers', 'Content-Type')
        res.set('Access-Control-Allow-Origin', req.headers.origin)
        res.set('Access-Control-Allow-Credentials', 'true')

        const stmt = db.prepare(`INSERT INTO favoriteCities
                                 VALUES (?)`)
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
    .delete((req, res) => {
        res.set('Access-Control-Allow-Methods', 'DELETE');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Allow-Origin', req.headers.origin);
        res.set('Access-Control-Allow-Credentials', 'true');

        const stmt = db.prepare(`DELETE
                                 FROM favoriteCities
                                 WHERE city_name = ?`)
        stmt.run([req.query.cityName], (err, rows) => {
            if (!err) {
                res.json(req.query.cityName)
                console.log('Deleted from favorite: ' + req.query.cityName)
            } else {
                res.sendStatus(500)
                console.log('Error while deleting from favorite: ' + req.query.cityName)
            }
        })
        stmt.finalize()
    })

async function getWeatherByCityName(name) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&q=${encodeURIComponent(name)}&appid=${API_KEY}`)
    a = res.status
    return res.json()
}

async function getWeatherByCoordinates(lat, lon) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    return res.json()
}

db.run('CREATE TABLE IF NOT EXISTS favoriteCities (city_name TEXT)')

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.use(cors())