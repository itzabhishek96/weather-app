import React, { useState, useEffect } from 'react';
import { UilSort } from '@iconscout/react-unicons'


function Citydata({ onCityClick, onCityRightClick }) {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [filterOption, setFilterOption] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?limit=100`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const jsonData = await response.json();
                console.log('Fetched Data:', jsonData);
                if (!jsonData || !jsonData.results || !Array.isArray(jsonData.results)) {
                    throw new Error('Invalid data structure received');
                }
                setData(jsonData.results);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error.message);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        let filtered = data.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Apply the sorting function to the filtered data
        filtered = sortData(filtered, sortConfig);
        
        setFilteredData(filtered);
    }, [searchTerm, data, sortConfig]); // Include sortConfig as a dependency
    

    const handleCityClick = (cityName) => {
        onCityClick && onCityClick(cityName);
    };

    const handleCityRightClick = (e, city) => {
      e.preventDefault();
      onCityRightClick(city);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
};

const getSortDirectionIndicator = (columnName) => {
    if (sortConfig.key !== columnName) return null;
    if (sortConfig.direction === 'ascending') {
        return <UilSort className="w-4 h-4 inline-block" />;
    } else {
        return <UilSort className="w-4 h-4 inline-block" />;
    }
};

const sortData = (data, { key, direction }) => {
    if (!key) return data; // If no sort key is defined, return the data as-is

    return [...data].sort((a, b) => {
        if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
        return 0; // if equal
    });
};



    const handleFilterChange = (option) => {
        setFilterOption(option);
        if (option === 'All') {
            setFilteredData(data);
        } else {
            const filtered = data.filter(item => item.timezone.includes(option));
            setFilteredData(filtered);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 p-4">
                <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between mb-4">
                    <label htmlFor="table-search" className="sr-only">Search</label>
                    <div className="relative w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search city..."
                            onChange={(e) => setSearchTerm                            (e.target.value)}
                            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                    </div>
                    <div className="relative flex items-center">
    <select
        value={filterOption}
        onChange={(e) => handleFilterChange(e.target.value)}
        className="block appearance-none bg-white border border-gray-300 text-gray-900 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 mr-2"
    >
        <option className='readonly bg-gray-500 ' value="All">
            <span className="text-gray-400">Filter</span>
        </option>
        <option value="All">All timezones</option>
        <option value="Asia/Kabul">Asia/Kabul</option>
        <option value="America/Anguilla">America/Anguilla</option>
        <option value="Europe/Tirane">Europe/Tirane</option>
        <option value="Europe/Berlin">Europe/Berlin</option>
        {/* Add more timezones as needed */}
    </select>
   
</div>
                    
                </div>
               <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 p-4">
               <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="text-white text-md font-semibold px-6 py-3 cursor-pointer hover:text-gray-200" onClick={() => handleSort('name')}>
                    City {getSortDirectionIndicator('name')}
                </th>
                <th scope="col" className="text-white text-md font-semibold px-6 py-3 cursor-pointer hover:text-gray-200" onClick={() => handleSort('cou_name_en')}>
                    Country {getSortDirectionIndicator('cou_name_en')}
                </th>
                <th scope="col" className="text-white text-md font-semibold px-6 py-3 cursor-pointer hover:text-gray-200" onClick={() => handleSort('country_code')}>
                    Country code {getSortDirectionIndicator('country_code')}
                </th>
                <th scope="col" className="text-white text-md font-semibold px-6 py-3 cursor-pointer hover:text-gray-200" onClick={() => handleSort('timezone')}>
                    Timezone {getSortDirectionIndicator('timezone')}
                </th>
            </tr>
        </thead>
        <tbody>
            {filteredData.map((record, index) => (
                <tr
                    key={index}
                    onClick={(e) => handleCityClick(record.name)}
                    onContextMenu={(e) => handleCityRightClick(e, record.name)}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-300 ease-in-out"
                >
                    <td className="px-6 py-4 break-words">
                        {record.name}
                    </td>
                    <td className="px-6 py-4 break-words">
                        {record.cou_name_en}
                    </td>
                    <td className="px-6 py-4 break-words">
                        {record.country_code}
                    </td>
                    <td className="px-6 py-4 break-words">{record.timezone}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>
            </div>
        </div>
    );
}

export default Citydata;