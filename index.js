let currentCityId
let defaultCityName = 'London'

window.addEventListener('load', async () => {
    for (const el of document.getElementsByClassName('updateLocation')) {
        el.addEventListener('click', updateWeatherHere)
    }

    document.querySelector('.favoriteSectionValue')
        .addEventListener('submit', (e) => {
            e.preventDefault()
            console.log(e.target.elements['cityToAdd'])
            addCity(e.target.elements['cityToAdd'].value)
            e.target.elements['cityToAdd'].value = ''
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
}

async function addCity(cityName) {
    if (cityName.length === 0) {
        return
    }
    try {
        let loadingElement = document.getElementById('loadingTitleAdd')
        loadingElement.classList.add('loaderVisible')

        const weather = await getWeatherByCityName(cityName)

        loadingElement.classList.remove('loaderVisible')

        if (!favorites.includes(weather.id) && weather.weather !== undefined) {
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


            console.log("Город добавлен в избранное")
        } else if (favorites.includes(weather.id)) {
            alert(`${weather.name} уже есть в избранном!`)
        } else {
            alert(`Не удалось добавить город "${cityName}"`)
        }
    } catch (e) {
        console.error(e)
        alert(`Не удалось добавить город "${cityName}"`)
    }
}

async function loadCity(id) {
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
}

async function updateWeatherHere() {
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

    currentCityId = weatherData.id
    setWeather(weatherHere, weatherData)
    loadingElement.classList.remove('loaderVisible')
    currentWeatherElement.classList.remove('loader')
}

function setWeather(cityElement, weather) {
    cityElement.querySelector('.cityHeaderTitle').textContent = weather.name
    cityElement.querySelector('.weatherIcon').src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`
    cityElement.querySelector('.cityHeaderTemperature').textContent = Math.round(weather.main.temp) + '°C'
    cityElement.querySelector('.cityInfo .wind').textContent = weather.wind.speed + ' m/s, ' + weather.wind.deg
    cityElement.querySelector('.cityInfo .cloudness').textContent = weather.clouds.all + ' %'
    cityElement.querySelector('.cityInfo .pressure').textContent = weather.main.pressure + ' hpa'
    cityElement.querySelector('.cityInfo .humidity').textContent = weather.main.humidity + ' %'
    cityElement.querySelector('.cityInfo .coords').textContent = '[' + weather.coord.lat + ' ' + weather.coord.lon + ']'
}


function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((location) => resolve(location.coords), reject)
    })
}

async function getWeatherByCityName(name) {
    const res = await fetch(`http://localhost:3000/weather/city?q=${name}`)
    return res.json()
}

async function saveFavoriteCity(name) {
    const res = await fetch(`http://localhost:3000/favorites?cityName=${name}`, {method:'POST'})
    return res.status
}

/*async function getWeatherByCityId(id) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lang=ru&units=metric&id=${id}&appid=${API_KEY}`)
    return res.json()
}*/

async function getWeatherByCoordinates(lat, lon) {
    const res = await fetch(`http://localhost:3000/weather/coordinates?lat=${lat}&long=${lon}`)
    return res.json()
}
