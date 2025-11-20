import { useState, useEffect } from 'react';
import ThemeToggle from './composant/ThemeToggle';


function App() {
 

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <h1 className="text-2xl p-4">Hello Tailwind Dark Mode!</h1>
      <ThemeToggle />
    </div>
  );
}

export default App;
