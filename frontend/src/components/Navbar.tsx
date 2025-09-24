import React from "react";

export function Navbar() {
  const navItems = [
    { name: "Features", link: "#features" },
    { name: "How It Works", link: "#workflow" },
    { name: "Security", link: "#security" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-4 flex items-center justify-between">
      {/* Logo */}
      <div className="text-xl font-bold text-white">Synthify</div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-6">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.link}
            className="text-neutral-400 hover:text-white transition-colors duration-300"
          >
            {item.name}
          </a>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        <button className="text-neutral-400 hover:text-white transition-colors duration-300">
          Login
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-300">
          Register
        </button>
      </div>
    </nav>
  );
}