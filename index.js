let currentCityName
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
    updateWeatherHere()

    const cities = await getFavoriteCity()
    cities.forEach(cityName => {
        loadCity(cityName)
    })

})


async function removeCity(name, button) {

    button.disabled = true

    let loadingElement = document.getElementById('loadingTitleAdd')
    loadingElement.classList.add('loaderVisible')

    try {
        const deleteRes = await deleteFavoriteCity(name)
        console.log("DELETE STATUS = " + deleteRes.status)

        if (deleteRes.status === 200) {
            const favoritesList = document.getElementById('favoriteCitiesList')
            const city = favoritesList.querySelector(`.city[cityName="${name}"]`)
            if (city !== null) {
                favoritesList.removeChild(city)
            }
        } else {
            alert(`Не удалось удалить город "${name}"`)
        }
        loadingElement.classList.remove('loaderVisible')
        button.disabled = false
    } catch {
        loadingElement.classList.remove('loaderVisible')
        alert(`Не удалось удалить город "${name}"`)
        button.disabled = false
    }
    button.disabled = false

}

async function addCity(cityName) {
    if (cityName.length === 0) {
        alert(`Введите название города, чтобы добавить!`)
        return
    }
    let loadingElement = document.getElementById('loadingTitleAdd')
    try {
        loadingElement.classList.add('loaderVisible')
        const weather = await getWeatherByCityName(cityName)
        console.log("TEST" + weather.weather)
        if (weather.weather !== undefined) {
            const pushStatus = await saveFavoriteCity(weather.name)


            if (pushStatus === 200) {
                //const weather = await getWeatherByCityName(cityName)
                loadingElement.classList.remove('loaderVisible')

                if (weather.weather !== undefined) {
                    const favoritesEl = document.getElementById('favoriteCitiesList')
                    const template = document.getElementById('favoriteCityTemplate')
                    const city = document.importNode(template.content, true)

                    const el = city.children[0]

                    el.setAttribute('cityName', weather.name)
                    el.querySelector(".deleteCity").addEventListener('click', () => {
                       removeCity(weather.name, el.querySelector(".deleteCity"))
                    })

                    setWeather(el, weather)
                    favoritesEl.appendChild(city)

                    console.log("Город добавлен в избранное")
                }
            } else {
                loadingElement.classList.remove('loaderVisible')
                alert(`Не удалось добавить город "${cityName}"`)
            }
        } else {
            loadingElement.classList.remove('loaderVisible')
            alert(`Не удалось добавить город "${cityName}"`)
        }
    } catch (e) {
        loadingElement.classList.remove('loaderVisible')
        //console.error(e)
        alert(`Не удалось добавить город "${cityName}"`)
    }

}

async function loadCity(name) {
    const weather = await getWeatherByCityName(name)
    const favoritesList = document.getElementById('favoriteCitiesList')
    const template = document.getElementById('favoriteCityTemplate')
    const city = document.importNode(template.content, true)
    const el = city.children[0]

    el.setAttribute('cityName', weather.name)
    el.querySelector('.deleteCity')
        .addEventListener('click', () => removeCity(weather.name))

    setWeather(el, weather)
    favoritesList.appendChild(city)
}

async function updateWeatherHere() {
    let loadingElement = document.getElementById('loadingTitle')
    try {
        let weatherData
        const weatherHere = document.getElementById('weatherHereSection')
        let currentWeatherElement = document.getElementById('weatherHereSection')

        currentWeatherElement.classList.add('loader')
        loadingElement.classList.add('loaderVisible')

        if (currentCityName !== undefined) {
            weatherData = await getWeatherByCityName(currentCityName)
        } else {
            try {
                const currentCoordinates = await getCurrentLocation()
                weatherData = await getWeatherByCoordinates(currentCoordinates.latitude, currentCoordinates.longitude)
            } catch (e) {
                weatherData = await getWeatherByCityName(defaultCityName)
            }
        }

        setWeather(weatherHere, weatherData)
        loadingElement.classList.remove('loaderVisible')
        currentWeatherElement.classList.remove('loader')
    } catch {
        loadingElement.classList.remove('loaderVisible')
        alert(`Ошибка во время загрузки "${name}"`)
    }
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
    const res = await fetch(`http://localhost:3000/weather/city?cityName=${name}`)
    return res.json()
}

async function saveFavoriteCity(name) {
    const res = await fetch(`http://localhost:3000/favorites?cityName=${name}`, {method: 'POST'})
    return res.status
}

async function deleteFavoriteCity(name) {
    const res = await fetch(`http://localhost:3000/favorites?cityName=${name}`, {method: 'DELETE'})
    return res
}

async function getFavoriteCity() {
    const res = await fetch(`http://localhost:3000/favorites`, {method: 'GET'})
    return res.json()
}

async function getWeatherByCoordinates(lat, lon) {
    const res = await fetch(`http://localhost:3000/weather/coordinates?lat=${lat}&long=${lon}`)
    return res.json()
}
