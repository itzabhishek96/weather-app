import React, { useState, useEffect } from "react";
import { UilSort,UilSearch,UilFilter } from "@iconscout/react-unicons";

function Citydata({ onCityClick }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [filterOption, setFilterOption] = useState("All");
  const [sortDirection, setSortDirection] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?limit=100`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const jsonData = await response.json();
        console.log("Fetched Data:", jsonData);
        if (
          !jsonData ||
          !jsonData.results ||
          !Array.isArray(jsonData.results)
        ) {
          throw new Error("Invalid data structure received");
        }
        setData(jsonData.results);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        item.name.toLowerCase() !== "allambres"
    );

    filtered = sortData(filtered, sortConfig);

    setFilteredData(filtered);
  }, [searchTerm, data, sortConfig]);

  const handleCityClick = (cityName) => {
    onCityClick && onCityClick(cityName);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleCityRightClick = (e, city) => {
    e.preventDefault(); 
    localStorage.setItem("selectedCity", city); 
    window.open("/Weatherdetails", "_blank"); 
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortDirectionIndicator = (columnName) => {
    if (sortConfig.key !== columnName) return null;
    if (sortConfig.direction === "ascending") {
      return <UilSort className="w-4 h-4 inline-block" />;
    } else {
      return <UilSort className="w-4 h-4 inline-block" />;
    }
  };

  const sortData = (data, { key, direction }) => {
    if (!key) return data;

    return [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
      if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
      return 0;
    });
  };

  const handleFilterChange = (option) => {
    setFilterOption(option);
    if (option === "All") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) => item.timezone.includes(option));
      setFilteredData(filtered);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-gray-800 p-4">
          <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between mb-4">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UilSearch className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search city..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="relative flex items-center">
              <select
                value={filterOption}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="block appearance-none bg-white border border-gray-300 text-gray-900 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="All">All timezones</option>
                <option value="Asia/Kabul">Asia/Kabul</option>
                <option value="America/Anguilla">America/Anguilla</option>
                <option value="Europe/Tirane">Europe/Tirane</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
                <option value="America/New_York">America/New York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
              <UilFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          <div className="relative overflow-x-auto">
            <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                <tr>
                  <th
                    scope="col"
                    className="text-white text-md font-semibold px-6 py-3 cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort("name")}
                  >
                    City {getSortDirectionIndicator("name")}
                  </th>
                  <th
                    scope="col"
                    className="text-white text-md font-semibold px-6 py-3 cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort("cou_name_en")}
                  >
                    Country {getSortDirectionIndicator("cou_name_en")}
                  </th>
                  <th
                    scope="col"
                    className="text-white text-md font-semibold px-6 py-3 cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort("country_code")}
                  >
                    Country code {getSortDirectionIndicator("country_code")}
                  </th>
                  <th
                    scope="col"
                    className="text-white text-md font-semibold px-6 py-3 cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort("timezone")}
                  >
                    Timezone {getSortDirectionIndicator("timezone")}
                  </th>
                </tr>
              </thead>
              <tbody className="max-h-96 overflow-y-auto">
                {filteredData.map((record, index) => (
                  <tr
                    key={index}
                    onClick={() => handleCityClick(record.name)}
                    onContextMenu={(e) => handleCityRightClick(e, record.name)}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-300 ease-in-out"
                  >
                    <td className="px-6 py-4 break-words">{record.name}</td>
                    <td className="px-6 py-4 break-words">
                      {record.cou_name_en}
                    </td>
                    <td className="px-6 py-4 break-words">
                      {record.country_code}
                    </td>
                    <td className="px-6 py-4 break-words">{record.timezone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Citydata;
