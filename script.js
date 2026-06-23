window.onload = function () {
  //  Input Elements
  const cityInput = document.getElementById("cityInput");
  const searchBtn = document.getElementById("searchBtn");

  //  Current Weather Elements
  const cityName = document.getElementById("cityName");
  const countryOrRegion = document.getElementById("country");
  const temperature = document.getElementById("temperature");
  const description = document.getElementById("description");
  const weatherIcon = document.getElementById("weatherIcon");
  const humidity = document.getElementById("humidity");
  const wind = document.getElementById("wind");
  const feelsLike = document.getElementById("feelsLike");

  //  Other Elements
  const hourlyList = document.getElementById("hourlyList");
  const forecastList = document.getElementById("forecastList");
  const aqiValue = document.getElementById("aqiValue");
  const alertsContainer = document.getElementById("alertsContainer");
  const videoBg = document.getElementById("video-bg");

  //  Hourly Scroll Buttons
  const slideLeft = document.getElementById("slideLeft");
  const slideRight = document.getElementById("slideRight");

  //  Scroll Left
  slideLeft.addEventListener("click", () => {
    hourlyList.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  });

  //  Scroll Right
  slideRight.addEventListener("click", () => {
    hourlyList.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  });

  //  Tabs
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const activeBtn = document.querySelector(".tab-btn.active");
      if (activeBtn) {
        activeBtn.classList.remove("active");
      }

      const activePanel = document.querySelector(".tab-panel.active");
      if (activePanel) {
        activePanel.classList.remove("active");
      }

      btn.classList.add("active");

      const tabId = btn.dataset.tab;
      document.getElementById(tabId).classList.add("active");
    });
  });

  //  Change Background Video
  function changeVideo(weather) {
    weather = weather.toLowerCase();

    if (weather.includes("rain")) {
      videoBg.src = "videos/rain.mp4";
    } else if (
      weather.includes("cloud") ||
      weather.includes("mist") ||
      weather.includes("fog")
    ) {
      videoBg.src = "videos/cloudy.mp4";
    } else if (weather.includes("snow")) {
      videoBg.src = "videos/snow.mp4";
    } else {
      videoBg.src = "videos/sunny.mp4";
    }
  }

  //  Show Hourly Detail
  function renderHourlyDetail(hourData) {
    let detailContainer = document.getElementById("hourly-detail-panel");

    if (!detailContainer) {
      detailContainer = document.createElement("div");
      detailContainer.id = "hourly-detail-panel";

      document.getElementById("hourly").appendChild(detailContainer);
    }

    detailContainer.innerHTML = `
      <div class="hourly-expanded-card">

        <div class="detail-header">
          <span class="pulse-dot"></span>
          <p class="condition-lbl">
            Condition:
            <strong>${hourData.condition.text}</strong>
          </p>
        </div>

        <div class="detail-grid">

          <div class="detail-metric">
            <span class="metric-title">Feels Like</span>
            <p class="metric-value">${hourData.feelslike_c}°C</p>
          </div>

          <div class="detail-metric">
            <span class="metric-title">Rain Chance</span>
            <p class="metric-value">${hourData.chance_of_rain}%</p>
          </div>

          <div class="detail-metric">
            <span class="metric-title">Humidity</span>
            <p class="metric-value">${hourData.humidity}%</p>
          </div>

          <div class="detail-metric">
            <span class="metric-title">Wind</span>
            <p class="metric-value">${hourData.wind_kph} km/h</p>
          </div>

        </div>

      </div>
    `;
  }

  //  Fetch Weather (Updated to accept city name or lat,lon string)
  async function fetchWeather(query) {
    try {
      const apiKey = "b237dfc7533247e784c180834260906";
      const response = await axios(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=7&aqi=yes&alerts=yes`,
      );

      const data = response.data;

      //  Current Weather
      cityName.innerText = data.location.name;
      countryOrRegion.innerText =
        data.location.region + ", " + data.location.country;

      temperature.innerText = data.current.temp_c + " °C";
      description.innerText = data.current.condition.text;
      humidity.innerText = data.current.humidity + "%";
      wind.innerText = data.current.wind_kph + " km/h";
      feelsLike.innerText = data.current.feelslike_c + " °C";

      weatherIcon.src = "https:" + data.current.condition.icon;

      changeVideo(data.current.condition.text);

      //  Hourly Forecast
      hourlyList.innerHTML = "";

      let hourlyData = [];

      const currentHour = new Date().getHours();

      data.forecast.forecastday[0].hour.forEach((hour) => {
        let hourNumber = new Date(hour.time).getHours();

        if (hourNumber >= currentHour) {
          hour.displayTime = hour.time.split(" ")[1];

          if (hourNumber === currentHour) {
            hour.displayTime = "Now";
          }

          hourlyData.push(hour);
        }
      });

      //  Add Tomorrow Hours
      if (hourlyData.length < 12) {
        data.forecast.forecastday[1].hour.forEach((hour) => {
          if (hourlyData.length < 24) {
            hour.displayTime = hour.time.split(" ")[1];
            hour.isTomorrow = true;

            hourlyData.push(hour);
          }
        });
      }

      //  Create Cards
      hourlyData.forEach((hour, index) => {
        const card = document.createElement("div");

        card.className = "hourly-item";

        if (index === 0) {
          card.classList.add("selected-hour");
        }

        if (hour.isTomorrow) {
          card.style.opacity = ".85";
        }

        card.innerHTML = `
          <p><strong>${hour.displayTime}</strong></p>
          <img src="https:${hour.condition.icon}">
          <p><strong>${hour.temp_c}°C</strong></p>
        `;

        card.addEventListener("click", () => {
          document.querySelectorAll(".hourly-item").forEach((item) => {
            item.classList.remove("selected-hour");
          });

          card.classList.add("selected-hour");

          renderHourlyDetail(hour);
        });

        hourlyList.appendChild(card);
      });

      if (hourlyData.length > 0) {
        renderHourlyDetail(hourlyData[0]);
      }

      //  5-Day Forecast
      forecastList.innerHTML = "";

      data.forecast.forecastday.forEach((day) => {
        let dayName = new Date(day.date).toLocaleDateString("en-US", {
          weekday: "short",
        });

        forecastList.innerHTML += `
          <div class="forecast-row">
            <span><strong>${dayName}</strong></span>
            <img src="https:${day.day.condition.icon}">
            <span>${day.day.avgtemp_c}°C</span>
          </div>
        `;
      });

      //  Air Quality
      const aqi = data.current.air_quality;

      const aqiText = {
        1: "Good",
        2: "Moderate",
        3: "Unhealthy",
        4: "Unhealthy",
        5: "Very Unhealthy",
        6: "Hazardous",
      };

      aqiValue.innerText = aqiText[aqi["us-epa-index"]] || "Unknown";

      document.getElementById("aqi-co").innerText =
        Math.round(aqi.co) + " µg/m³";

      document.getElementById("aqi-no2").innerText =
        Math.round(aqi.no2) + " µg/m³";

      document.getElementById("aqi-o3").innerText =
        Math.round(aqi.o3) + " µg/m³";

      document.getElementById("aqi-pm25").innerText =
        Math.round(aqi.pm2_5) + " µg/m³";

      //  Alerts
      alertsContainer.innerHTML = "";

      if (data.alerts.alert.length > 0) {
        data.alerts.alert.forEach((alert) => {
          alertsContainer.innerHTML += `
            <div class="alert-item">
              <h4>${alert.event}</h4>
              <p>${alert.headline}</p>
            </div>
          `;
        });
      } else {
        alertsContainer.innerHTML =
          "<p class='no-alerts'>No active weather alerts for this city.</p>";
      }
    } catch (error) {
      console.log(error);
      alert("City not found or API error!");
    }
  }

  //  Search Button
  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (city !== "") {
      fetchWeather(city);
    }
  });

  //  Enter Key
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });

  //  Current Location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(`${lat},${lon}`);
      },
      (error) => {
        console.log("Geolocation error or denied, falling back to Karachi.");
        fetchWeather("Karachi");
      },
    );
  } else {
    fetchWeather("Karachi");
  }
};
