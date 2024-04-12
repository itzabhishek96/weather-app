import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import getFormattedWeatherData, { getForecastData } from "../services/weatherService";
import Citydata from "./Citydata";
import TopButtons from "./TopButtons";
import Inputs from "./Inputs";
import TimeAndLocation from "./TimeAndLocation";
import TemperatureAndDetails from "./TemperatureAndDetails";
import Forecast from "./Forecast";
import { UilArrowLeft } from "@iconscout/react-unicons";
import { Link } from "react-router-dom";
import hotBg from "../assets/hot.jpg";
import coldBg from "../assets/cold.jpg";
import clearBg from "../assets/clear.jpg";
import hazeBg from "../assets/haze.jpg";
import cloudyBg from "../assets/cloudy.jpg";
import rainyBg from "../assets/rainy.jpg";

function WeatherDetails() {
  const [query, setQuery] = useState({ q: "" });
  const [units, setUnits] = useState("metric");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [bg, setBg] = useState(clearBg);

  useEffect(() => {
    const fetchData = async () => {
      let cityName = query.q;
      if (!cityName) {
        cityName = localStorage.getItem("selectedCity");
        localStorage.removeItem("selectedCity");
      }

      if (cityName) {
        toast.info(`Fetching weather for ${cityName}`);
        const data = await getFormattedWeatherData({ q: cityName, units });
        if (data) {
          setWeather(data);
          toast.success(`Weather data loaded for ${cityName}`);
          updateBackground(data);
          if (data.lat && data.lon) {
            const forecastData = await getForecastData(
              data.lat,
              data.lon,
              units
            );
            setForecast(forecastData);
          }
        } else {
          toast.error("Failed to load weather data");
        }
      }
    };
    fetchData();
  }, [query, units]);

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
    const fetchData = async () => {
      if (query.q || (query.lat && query.lon)) {
        const currentWeather = await getFormattedWeatherData({
          ...query,
          units,
        });
        setWeather(currentWeather);
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

  const updateBackground = (weatherData) => {
    let newBg = coldBg;
    switch (weatherData.details.toLowerCase()) {
      case "clear":
        newBg = clearBg;
        break;
      case "clouds":
        newBg = cloudyBg;
        break;
      case "haze":
        newBg = hazeBg;
        break;
      case "smoke":
        newBg = hazeBg;
        break;
      case "hot":
        newBg = hotBg;
        break;
      case "rain":
        newBg = rainyBg;
        break;
      default:
        newBg = coldBg;
        break;
    }
    setBg(newBg);
  };

  const onCityClick = (cityName) => {
    setQuery({ q: cityName });
  };
  const onCityRightClick = (cityName) => {
    setQuery({ q: cityName });
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
        {!weather && (
          <Citydata
            onCityClick={onCityClick}
            onCityRightClick={onCityRightClick}
          />
        )}

        <ToastContainer />

        <div className="mx-auto max-w-screen-md border-black px-6 bg-gray-700 bg-opacity-75 rounded-lg shadow-xl">
          {weather && (
            <>
              <div className="flex items-center justify-between text-gray-300 hover:text-white focus:outline-none">
                <Link to="/">
                  <UilArrowLeft size={30} className="mt-4" />
                </Link>
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

export default WeatherDetails;
