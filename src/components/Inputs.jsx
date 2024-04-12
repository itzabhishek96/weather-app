import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { UilLocationPoint } from "@iconscout/react-unicons";
import debounce from "lodash/debounce";
import { fetchCities } from "../services/weatherService";
import { AsyncPaginate } from "react-select-async-paginate";

function Inputs({ setQuery, units, setUnits, onSearchChange }) {
  const [city, setCity] = useState("");
  const [searchValue, setSearchValue] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const GEO_API_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo";
  const GEO_API_OPTIONS = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "c0a250efc2mshcf53fe40c0cb341p1892cfjsn95f42bcff977",
      "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
    },
  };

  useEffect(() => {
    if (city.length > 0) {
      setIsSearching(true);
      fetchCitiesDebounced(city);
    } else {
      setIsSearching(false);
    }
  }, [city]);

  const loadOptions = async (inputValue) => {
    setIsSearching(true);
    const response = await fetchCities(inputValue);
    setIsSearching(false);
    return {
      options: response.data.map((city) => ({
        value: `${city.latitude} ${city.longitude}`,
        label: `${city.name}, ${city.countryCode}`,
      })),
    };
  };

  const onChangeHandler = (option) => {
    setSearchValue(option);
    if (option) {
      setQuery({ q: option.label });
    } else {
      setQuery({});
    }
  };

  const fetchCitiesDebounced = debounce(async (input) => {
    try {
      const response = await fetch(
        `${GEO_API_URL}/cities?minPopulation=10000&namePrefix=${input}`,
        GEO_API_OPTIONS
      );
      const data = await response.json();
      setIsSearching(false);
    } catch (error) {
      console.error(error);
      setIsSearching(false);
    }
  }, 300); // 300ms debounce time

  const handleUnitsChange = (e) => {
    const selectedUnit = e.currentTarget.name;
    if (units !== selectedUnit) setUnits(selectedUnit);
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      toast.info("Fetching user's location.");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.success("Location fetched!");
          const { latitude, longitude } = position.coords;
          setQuery({
            lat: latitude,
            lon: longitude,
          });
        },
        (err) => {
          toast.error("Failed to fetch location: " + err.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="inputs-container flex items-center justify-center">
      <div className="search-bar w-full relative">
        <AsyncPaginate
          value={searchValue}
          onChange={onChangeHandler}
          loadOptions={loadOptions}
          placeholder="Search for city..."
          isSearching={isSearching}
          debounceTimeout={600} // Debounce time for typing
          additional={{
            page: 1,
          }}
        />
        <UilLocationPoint
          size={20}
          className="location-icon absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={handleLocationClick}
        />
      </div>

      <div className="unit-toggle flex items-center ml-4">
        <button
          name="metric"
          className="text-xl text-white font-light transition ease-out hover:scale-125"
          onClick={handleUnitsChange}
        >
          &deg;C
        </button>
        <p className="text-xl text-white mx-2">|</p>
        <button
          name="imperial"
          className="text-xl text-white font-light transition ease-out hover:scale-125"
          onClick={handleUnitsChange}
        >
          &deg;F
        </button>
      </div>
    </div>
  );
}

export default Inputs;
