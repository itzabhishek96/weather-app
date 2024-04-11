import { DateTime } from "luxon";
import { toast } from 'react-toastify';


const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// https://api.openweathermap.org/data/2.5/onecall?lat=48.8534&lon=2.3488&exclude=current,minutely,hourly,alerts&appid=1fa9ff4126d95b8db54f3897a208e91c&units=metric
const GEO_API_URL = 'https://wft-geo-db.p.rapidapi.com/v1/geo';


const GEO_API_OPTIONS = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': process.env.REACT_APP_GEO_API_KEY,
    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
  },
};


const getForecastData = async (lat, lon, units = 'metric') => {
  const url = new URL(`${BASE_URL}/forecast`);
  url.search = new URLSearchParams({
    lat,
    lon,
    appid: API_KEY,
    units, // Metric or imperial
  });

  const response = await fetch(url);
  const data = await response.json();
  return formatForecastData(data);
};

// Modify in weatherService.js

const formatForecastData = (data) => {
  return data.list.slice(0, 5).map(item => ({
    dt: item.dt_txt,
    temp: item.main.temp,
    feels_like: item.main.feels_like,
    temp_min: item.main.temp_min,
    temp_max: item.main.temp_max,
    weather: item.weather[0].description,
    icon: item.weather[0].icon,
    wind_speed: item.wind.speed,
    pop: item.pop, // Probability of precipitation
  }));
};

export { getForecastData };

const getWeatherData = async (infoType, searchParams) => {
  const url = new URL(BASE_URL + "/" + infoType);
  url.search = new URLSearchParams({ ...searchParams, appid: API_KEY });

  const res = await fetch(url);
  return await res.json();
};

// Revised formatCurrentWeather function with added safety checks
const formatCurrentWeather = (data) => {
    // Early return if coord is not defined
    if (!data || !data.coord) {
      console.error('No coordinate data available', data);
      toast.error("No coordinate data available. Please try another search.");
      // Consider returning a default structure or null
      return null; // or return a default object structure
    }
  
    const {
      coord: { lat, lon },
      main: { temp, feels_like, temp_min, temp_max, humidity },
      name,
      dt,
      sys: { country, sunrise, sunset },
      weather,
      wind: { speed },
    } = data;
  
    const { main: details, icon } = weather[0];
  
    return {
      lat,
      lon,
      temp,
      feels_like,
      temp_min,
      temp_max,
      humidity,
      name,
      dt,
      country,
      sunrise,
      sunset,
      details,
      icon,
      speed,
    };
  };
  
  // Modifications in getFormattedWeatherData for safer execution
  const getFormattedWeatherData = async (searchParams) => {
    try {
      const formattedCurrentWeather = await getWeatherData(
        "weather",
        searchParams
      ).then(formatCurrentWeather);
  
      // Early return or error handling if formattedCurrentWeather is null
      if (!formattedCurrentWeather) {
        // Return a default value or handle the error as appropriate
        return null; // or handle as appropriate
      }
  
      const { lat, lon } = formattedCurrentWeather;
  
      const formattedForecastWeather = await getWeatherData("onecall", {
        lat,
        lon,
        exclude: "current,minutely,alerts",
        units: searchParams.units,
      }).then(formatForecastWeather);
  
      return { ...formattedCurrentWeather, ...formattedForecastWeather };
    } catch (error) {
      console.error('Error getting formatted weather data:', error);
      // Handle the error or return a default value
      return null; // or handle as appropriate
    }
  };
  

// const formatCurrentWeather = (data) => {
//   const {
//     coord: { lat, lon },
//     main: { temp, feels_like, temp_min, temp_max, humidity },
//     name,
//     dt,
//     sys: { country, sunrise, sunset },
//     weather,
//     wind: { speed },
//   } = data;

//   const { main: details, icon } = weather[0];

//   return {
//     lat,
//     lon,
//     temp,
//     feels_like,
//     temp_min,
//     temp_max,
//     humidity,
//     name,
//     dt,
//     country,
//     sunrise,
//     sunset,
//     details,
//     icon,
//     speed,
//   };
// };

const formatForecastWeather = (data) => {
  let { timezone, daily, hourly } = data;

  // If daily or hourly is undefined, return empty arrays
  if (!daily || !hourly) {
      return { timezone, daily: [], hourly: [] };
  }

  // Slice and map the daily forecast data
  daily = daily.slice(1, 6).map(d => {
      return {
          title: formatToLocalTime(d.dt, timezone, 'ccc'),
          temp: d.temp.day,
          icon: d.weather[0].icon
      };
  });

  // Slice and map the hourly forecast data
  hourly = hourly.slice(1, 6).map(d => {
      return {
          title: formatToLocalTime(d.dt, timezone, 'hh:mm a'),
          temp: d.temp.day,
          icon: d.weather[0].icon
      };
  });

  return { timezone, daily, hourly };
};



// const getFormattedWeatherData = async (searchParams) => {
//   const formattedCurrentWeather = await getWeatherData(
//     "weather",
//     searchParams
//   ).then(formatCurrentWeather);

//   const { lat, lon } = formattedCurrentWeather;

//   const formattedForecastWeather = await getWeatherData("onecall", {
//     lat,
//     lon,
//     exclude: "current,minutely,alerts",
//     units: searchParams.units,
//   }).then(formatForecastWeather);

//   return { ...formattedCurrentWeather, ...formattedForecastWeather };
// };

const formatToLocalTime = (
  secs,
  zone,
  format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a"
) => DateTime.fromSeconds(secs).setZone(zone).toFormat(format);


export async function fetchCities(input) {
  try {
    const response = await fetch(
      `${GEO_API_URL}/cities?minPopulation=10000&namePrefix=${input}`,
      GEO_API_OPTIONS
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return;
  }
}


const iconUrlFromCode = (code) =>
  `http://openweathermap.org/img/wn/${code}@2x.png`;

export default getFormattedWeatherData;

export { formatToLocalTime, iconUrlFromCode };