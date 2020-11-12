const API_KEY = 'a27dec4b70b2790c1b457b039a45cfe9'
let currentCityId
let defaultCityName = 'London'

window.addEventListener('load', async () => {
    console.log("addEventListener")
    for (const el of document.getElementsByClassName('updateLocation')) {
        el.addEventListener('click', updateWeatherHere)
    }

    document.querySelector('.favoriteSectionValue')
        .addEventListener('submit', (e) => {
            console.log("Город добавлен в избранное")

            e.preventDefault()
            console.log(e.target.elements['cityToAdd'])
            addCity(e.target.elements['cityToAdd'].value)
        })

    try {
        favorites = JSON.parse(localStorage.getItem('favorites'))
        console.log(favorites)
    } catch (e) {
        console.error(e)
    }

    if (!Array.isArray(favorites)) {
        favorites = []
    }

    updateWeatherHere()

    favorites.forEach(id => loadCity(id))
})


function removeCity(id) {
    console.log(`Зашли в removeCity ${id}`)

    const favoritesList = document.getElementById('favoriteCitiesList')

    const city = favoritesList.querySelector(`.city[cityId="${id}"]`)
    if (city !== null) {
        favoritesList.removeChild(city)
    }

    const idx = favorites.indexOf(id)
    if (idx !== -1) {
        favorites.splice(idx, 1)
        localStorage.setItem('favorites', JSON.stringify(favorites))
    }

    console.log(`Вышли из removeCity ${id}`)
}

async function addCity(cityName) {
    console.log(`Зашли в addCity ${cityName}`)

    if (cityName.length === 0) {
        return
    }

    try {
        const weather = await getWeatherByCityName(cityName)
        if (!favorites.includes(weather.id)) {
            const favoritesEl = document.getElementById('favoriteCitiesList')
            const template = document.getElementById('favoriteCityTemplate')

            const city = document.importNode(template.content, true)

            const el = city.children[0]

            el.setAttribute('cityId', weather.id)
            el.querySelector(".deleteCity").addEventListener('click', () => removeCity(weather.id))


            setWeather(el, weather)

            favoritesEl.appendChild(city)
            favorites.push(weather.id)
            localStorage.setItem('favorites', JSON.stringify(favorites))
        }
    } catch (e) {
        console.error(e)
        alert(`Не удалось добваить город "${cityName}"`)
    }

    console.log(`Вышли из addCity ${cityName}`)

}

async function loadCity(id) {
    console.log(`Зашли в loadCity ${id}`)


    const weather = await getWeatherByCityId(id)
    const favoritesList = document.getElementById('favoriteCitiesList')
    const template = document.getElementById('favoriteCityTemplate')

    const city = document.importNode(template.content, true)
    const el = city.children[0]

    el.setAttribute('cityId', weather.id)
    el.querySelector('.deleteCity')
        .addEventListener('click', () => removeCity(weather.id))

    setWeather(el, weather)

    favoritesList.appendChild(city)

    console.log(`Вышли из loadCity ${id}`)

}

async function updateWeatherHere() {
    console.log(`Зашли в updateWeatherHere`)
    let weatherData

    const weatherHere = document.getElementById('weatherHereSection')
    let loadingElement = document.getElementById('loadingTitle')
    let currentWeatherElement = document.getElementById('weatherHereSection')

    currentWeatherElement.classList.add('loader')
    loadingElement.classList.add('loaderVisible')


    if (currentCityId !== undefined) {
        weatherData = await getWeatherByCityId(currentCityId)
    } else {
        try {
            const currentCoordinates = await getCurrentLocation()
            weatherData = await getWeatherByCoordinates(currentCoordinates.latitude, currentCoordinates.longitude)
        } catch (e) {
            weatherData = await getWeatherByCityName(defaultCityName)
        }
    }

    console.log(`Внутри updateWeatherHere. Weather = ${weatherData}`)
    console.log(`Внутри updateWeatherHere. WeatherHere = ${weatherHere}`)


    currentCityId = weatherData.id
    setWeather(weatherHere, weatherData)

    loadingElement.classList.remove('loaderVisible')
    currentWeatherElement.classList.remove('loader')

}

function setWeather(cityElement, weather) {
    console.log("Зашли в setWeather")

    cityElement.querySelector('.cityHeaderTitle').textContent = weather.name
    cityElement.querySelector('.weatherIcon').src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`
    cityElement.querySelector('.cityHeaderTemperature').textContent = Math.round(weather.main.temp) + '°C'
    cityElement.querySelector('.cityInfo .wind').textContent = weather.wind.speed + ' m/s, ' + weather.wind.deg
    cityElement.querySelector('.cityInfo .cloudness').textContent = weather.clouds.all + ' %'
    cityElement.querySelector('.cityInfo .pressure').textContent = weather.main.pressure + ' hpa'
    cityElement.querySelector('.cityInfo .humidity').textContent = weather.main.humidity + ' %'
    cityElement.querySelector('.cityInfo .coords').textContent = '[' + weather.coord.lat + ' ' + weather.coord.lon + ']'

    console.log("Вышли из setWeather")

}


function getCurrentLocation() {
    console.log("Вызван getCurrentLocation")
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((location) => resolve(location.coords), reject)
    })
}

async function getWeatherByCityName(name) {
    console.log(`Вызван getWeatherForCityName ${name}`)
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&q=${name}&appid=${API_KEY}`)
    return res.json()
}

async function getWeatherByCityId(id) {
    console.log(`Вызван getWeatherForCityID ${id}`)
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&id=${id}&appid=${API_KEY}`)
    return res.json()
}

async function getWeatherByCoordinates(lat, lon) {
    console.log(`Вызван getWeatherForCoords ${lat} и ${lon} `)
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    return res.json()
}


