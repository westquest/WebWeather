import express from 'express'
import {Api} from './Api.js'
import cors from 'cors'

export const app = express()
const port = 3000
import sqlite3i from 'sqlite3'

const api = new Api()

let sqlite3 = sqlite3i.verbose()
let db = new sqlite3.Database('./sqlite.db')


app.get('/weather/city', async (req, res) => {
    const cityName = req.query.cityName
    //console.log("Getting weather for name " + cityName)
    res.set('Access-Control-Allow-Origin', '*')
    try {
        if (typeof cityName !== 'string' || cityName === ""){
            res.status(400).end('Missed or wrong cityName param');
            return;
        }
        const response = await api.getWeatherByCityName(cityName)
        if (response.cod === 200) {
            res.json(response)
        } else{
            res.status(response.cod).end()
        }
    } catch (e) {
        console.error(e)
        res.status(500).end()
    }

})

app.get('/weather/coordinates', async (req, res) => {
    const lat = req.query.lat
    const long = req.query.long
    res.set('Access-Control-Allow-Origin', '*')
    try {
        if (typeof lat !== 'string' || typeof long !== 'string' || lat === "" || long === ""){
            res.status(400).end('Missed or wrong lat or long param');
            return;
        }
        const response = await api.getWeatherByCoordinates(lat, long)
        if (response.cod === 200) {
            res.json(response)
        } else{
            res.status(response.cod).end()
        }
    } catch (e) {
        console.error(e)
        res.status(500).end()
    }
})

app.route('/favorites')
    .get((req, res) => {
        res.set('Access-Control-Allow-Credentials', 'true')
        res.set('Access-Control-Allow-Origin', req.headers.origin)
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
            } else {
                res.sendStatus(500)
                console.log('Error while adding to favorite: ' + req.query.cityName)
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


db.run('CREATE TABLE IF NOT EXISTS favoriteCities (city_name TEXT)')

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.use(cors())