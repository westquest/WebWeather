import fetch from 'node-fetch'

export class Api {
    static API_KEY = 'a27dec4b70b2790c1b457b039a45cfe9'

    async getWeatherByCityName(name) {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&q=${encodeURIComponent(name)}&appid=${Api.API_KEY}`)
        return res.json()
    }

    async getWeatherByCoordinates(lat, lon) {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&lat=${lat}&lon=${lon}&appid=${Api.API_KEY}`)
        return res.json()
    }

}