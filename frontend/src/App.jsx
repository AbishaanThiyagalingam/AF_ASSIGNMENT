import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Country from "./pages/Country";
import Like from "./pages/Like";
import Wishlist from "./pages/Wishlist";
import CountryDetail from "./components/CountryDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/country" element={<Country />} />
        <Route path="/country/:cca3" element={<CountryDetail />} />
        <Route path="/Like" element={<Like />} />
        <Route path="/Wishlist" element={<Wishlist />} />
      </Routes>
    </Router>
  );
}

export default App;
