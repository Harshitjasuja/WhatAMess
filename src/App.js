import "./App.css";
import Navbar from "./components/Navbar";
import SearchBar from "./components/searchbar";
import MessCard from "./components/messcard";
import WomenMode from "./components/WomenMode"
import VegNonVegToggle from "./components/VegNonveg";
function App() {
  return (
    <div > 

     
      <Navbar />
      <SearchBar />
      <MessCard/>
      <WomenMode/>
      <VegNonVegToggle/>
      </div>
    
  );
}

export default App;
