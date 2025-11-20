import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./composant/NavBar";


function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Navbar />

        <main className="flex-grow p-4 dark:bg-gray-800 bg-white transition-colors duration-300">
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
