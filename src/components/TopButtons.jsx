import React from "react";

function TopButtons({ setQuery }) {
  const cities = [
    {
      id: 1,
      title: "New York",
    },
    {
      id: 2,
      title: "Mumbai",
    },
    {
      id: 3,
      title: "Dubai",
    },
    {
      id: 4,
      title: "Toronto",
    },
    {
      id: 5,
      title: "Paris",
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-around my-2">
      {cities.map((city) => (
        <button
          key={city.id}
          className="text-white text-lg font-medium py-2 px-4 m-2 transition duration-300 ease-in-out transform hover:scale-105 hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded-md"
          onClick={() => setQuery({ q: city.title })}
          aria-label={`Show weather in ${city.title}`}
        >
          {city.title}
        </button>
      ))}
    </div>
  );
}

export default TopButtons;
