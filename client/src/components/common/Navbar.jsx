// src/components/common/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const categories = [
    { name: "CPU", slug: "cpu" },
    { name: "RAM", slug: "ram" },
    { name: "VGA", slug: "vga" },
    { name: "Mainboard", slug: "mainboard" },
    { name: "SSD", slug: "ssd" },
    { name: "PSU", slug: "psu" },
  ];

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-6">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                to={`/products?category=${cat.slug}`}
                className="block py-3 hover:text-blue-400 transition"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
