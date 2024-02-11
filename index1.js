const loadingIndicator = document.getElementById('loadingIndicator');
const weatherContainer = document.getElementById('weatherContainer');

function showLoading() {
    loadingIndicator.style.display = 'block';
    weatherContainer.style.display = 'none';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
    weatherContainer.style.display = 'block';
}

const fetchWeatherData = async (city) => {
    try {
        showLoading();
        const response = await fetch("/weather", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                city: city,
            })
        });
  
        if (!response.ok) {
            console.error('Error:', response.status, response.statusText);
            return null;
        }
  
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
    finally {
        hideLoading();
    }
  };
  
  const defaultCity = "Seoul";
  
  fetchWeatherData(defaultCity)
    .then(data => {
        if (data) {
          update(data)
        }
    });
  
  
  const form = document.getElementById("formCityName");
  form.addEventListener("submit", async function(event) {
    event.preventDefault();
  
  
      const cityName = document.getElementById("cityName").value;
  
      const data = await fetchWeatherData(cityName);
        if (data) {
            update(data)
          
    }
  });
  
  
  
    function update(data) {
        console.log(data);
        document.getElementById('temp').innerHTML = `${data.currentWeather.main.temp}°C`;
        document.getElementById('name').innerHTML = `${data.currentWeather.name}`;
        document.getElementById('desc').innerHTML = `${data.currentWeather.weather[0].description}`;
        document.getElementById('date').innerHTML = `${new Date(data.currentWeather.dt * 1000).toLocaleDateString()}`;
        document.getElementById('mainIcon').src = `http://openweathermap.org/img/w/${data.currentWeather.weather[0].icon}.png`
        document.getElementById('name').innerHTML = `${data.currentWeather.name}, ${data.currentWeather.sys.country}, [${data.currentWeather.coord.lat}, ${data.currentWeather.coord.lon}]`;
        document.getElementById('time').innerHTML = `${new Date(data.timezone.timestamp * 1000).toLocaleTimeString()}, ${data.timezone.abbreviation}`;
        
        async function fetchCityInfo(city) {
            try {
                const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${city}`);
                if (!response.ok) {
                    console.error('Error:', response.status, response.statusText);
                    return null;
                }
                const data = await response.json();
                const pageId = Object.keys(data.query.pages)[0];
                return data.query.pages[pageId].extract;
            } catch (error) {
                console.error('Error:', error.message);
                return null;
            }
        }
        
        fetchWeatherData(defaultCity)
            .then(async data => {
                if (data) {
                    update(data);
                    const cityInfo = await fetchCityInfo(data.currentWeather.name);
                    if (cityInfo) {
                        document.getElementById('cityInfo').innerHTML = cityInfo;
                    }
                }
            });
        
        

        document.getElementById("so2").innerHTML = `${data.airPollution.list[0].components.so2}`;
        document.getElementById("no2").innerHTML = `${data.airPollution.list[0].components.no2}`;
        document.getElementById("o3").innerHTML = `${data.airPollution.list[0].components.o3}`;
        document.getElementById("pm2_5").innerHTML = `${data.airPollution.list[0].components.pm2_5}`;


        document.getElementById("sunrise").innerHTML = `${new Date(data.currentWeather.sys.sunrise * 1000).toLocaleTimeString()}`;
        document.getElementById("sunset").innerHTML = `${new Date(data.currentWeather.sys.sunset * 1000).toLocaleTimeString()}`;

        document.getElementById("humidity").innerHTML = `${data.currentWeather.main.humidity}%`;
        document.getElementById("cloud").innerHTML = `${data.currentWeather.clouds.all}%`;
        document.getElementById("wind").innerHTML = `${data.currentWeather.wind.speed}m/s`;
        document.getElementById("feels_like").innerHTML = `${data.currentWeather.main.feels_like}`;


    let tz = data.timezone
    console.log(tz);

  }

