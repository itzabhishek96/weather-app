import React, { useEffect, useState } from "react";
import "./App.css";
import TopButtons from "./components/TopButtons";
import Inputs from "./components/Inputs";
import TimeAndLocation from "./components/TimeAndLocation";
import TemperatureAndDetails from "./components/TemperatureAndDetails";
import getFormattedWeatherData from "./services/weatherService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import hotBg from "./assets/hot.jpg";
import coldBg from "./assets/cold.jpg";
import clearBg from "./assets/clear.jpg";
import hazeBg from "./assets/haze.jpg";
import cloudyBg from "./assets/cloudy.jpg";
import rainyBg from "./assets/rainy.jpg";
import Citydata from "./components/Citydata";
import Forecast from "./components/Forecast";
import { UilArrowLeft } from "@iconscout/react-unicons";
import { getForecastData } from "./services/weatherService";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [query, setQuery] = useState({ q: "" });
  const [units, setUnits] = useState("metric");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [bg, setBg] = useState("");
  const [showCityTable, setShowCityTable] = useState(true); // State to manage visibility of city table

  useEffect(() => {
    // Fetching weather data for the selected city
    const fetchWeather = async () => {
      const message = query.q ? query.q : "current location.";
      toast.info("Fetching weather for " + message);
      const data = await getFormattedWeatherData({ ...query, units });
      if (data) {
        toast.success(
          `Successfully fetched weather for ${data.name}, ${data.country}.`
        );
        setWeather(data);
      }
    };

    fetchWeather();
  }, [query, units]);

  useEffect(() => {
    if (weather) {
      // Default to a clear background
      let newBg = clearBg;

      // Modify the background based on the temperature or specific weather conditions
      const condition = weather.details.toLowerCase();
      if (weather.temp <= (units === "metric" ? 20 : 60)) {
        newBg = coldBg; // Cold weather
      }
      switch (condition) {
        case "clear":
          newBg = clearBg;
          break;
        case "clouds":
          // Assuming coldBg for cloudy, adjust as needed
          newBg = cloudyBg;
          break;
        case "smoke":
          newBg = hazeBg; // Example for rain, adjust to your available assets
          break;
        case "hot":
          newBg = hotBg;
          break;
        case "rain":
          newBg = rainyBg;
          break;
        case "cold":
          newBg = coldBg;
          break;
        // Add more cases for different conditions as necessary
      }
      setBg(newBg);
    }
  }, [weather, units]); // React to changes in weather data or units

  useEffect(() => {
    const fetchData = async () => {
      if (query.q) {
        const currentWeather = await getFormattedWeatherData({
          ...query,
          units,
        });
        setWeather(currentWeather);

        // Fetch 5-day forecast
        if (currentWeather.lat && currentWeather.lon) {
          const forecastData = await getForecastData(
            currentWeather.lat,
            currentWeather.lon,
            units
          );
          setForecast(forecastData);
        }
      }
    };

    fetchData();
  }, [query, units]);

  const onCityClick = (cityName) => {
    // Update the query state with the selected city's name
    setQuery({ q: cityName });
  };

  const handleBackButtonClick = () => {
    setWeather(null); // Clear weather data
    setShowCityTable(true); // Show city table
    setBg(""); // Clear background image when navigating back
  };

  return (
    <div
      className="app"
      style={{
        backgroundImage: `url(${bg})`,
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="overlay bg-transparent-500" style={{ height: "100vh" }}>
        {!weather && <Citydata onCityClick={onCityClick} />}
        <ToastContainer />

        <div className="mx-auto max-w-screen-md border-black px-6 bg-gray-700 bg-opacity-75 rounded-lg shadow-xl">
          {weather && (
            <>
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBackButtonClick}
                  className="text-gray-300 hover:text-white focus:outline-none"
                >
                  <UilArrowLeft size={30} className="mt-4" />
                </button>
              </div>
              <TopButtons setQuery={setQuery} />
              <Inputs setQuery={setQuery} units={units} setUnits={setUnits} />
              <TimeAndLocation weather={weather} />
              <TemperatureAndDetails weather={weather} />
              <Forecast title="hourly forecast" items={weather.hourly} />
              {forecast && (
                <div
                  className="flex overflow-x-auto py-2"
                  style={{ width: "100%" }}
                >
                  {forecast.slice(0, 5).map((f, index) => (
                    <div
                      key={index}
                      className="min-w-0 flex-none rounded-lg p-2 mx-2"
                      style={{ flex: "1 0 auto", maxWidth: "20%" }}
                    >
                      <p className="text-xs font-semibold text-center text-gray-200">
                        {new Date(f.dt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <img
                        src={`http://openweathermap.org/img/wn/${f.icon}@2x.png`}
                        alt="weather icon"
                        className="w-12 h-12 mx-auto"
                      />
                      <p className="text-sm text-center text-gray-200">
                        Temp: {Math.round(f.temp)}°
                      </p>
                      <p className="text-xs text-center text-gray-200">
                        {f.weather}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;