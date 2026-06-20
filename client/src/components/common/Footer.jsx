import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Đức Thịnh Tech Store. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
