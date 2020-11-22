const API_KEY = 'a27dec4b70b2790c1b457b039a45cfe9'

const fetch = require('node-fetch')
const express = require('express')
const app = express()
const port = 3000

app.get('/weather/city', (req, res) => {
    getWeatherByCityName('Moscow').then(r => {res.send(r)})
})

app.get('/weather/coordinates', (req, res) => {
    getWeatherByCoordinates('52.58', '36.4').then(r => {res.send(r)})
})

async function getWeatherByCityName(name) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&q=${name}&appid=${API_KEY}`)
    return res.json()
}

async function getWeatherByCoordinates(lat, lon) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    return res.json()
}




app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})



