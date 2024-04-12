import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import CityDetails from './components/WeatherDetails'; 
import WeatherDetails from './components/WeatherDetails';

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} exact />
        <Route path="/Weatherdetails" element={<WeatherDetails />} /> 
      </Routes>
    </Router>
  );
}

export default Main;
