import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { getToken, clearToken } from "./lib/api";

function Header(){
  const token = getToken();
  const loc = useLocation();
  return (
    <header style={{display:'flex', gap:12, alignItems:'center', padding:'12px 0'}}>
      <Link to="/">Home</Link>
      <Link to="/products">Products</Link>
      <span style={{flex:1}}/>
      {token ? (
        <>
          <Link to="/profile">Profile</Link>
          <button onClick={()=>{ clearToken(); window.location.href='/login'; }}>
            Logout
          </button>
        </>
      ) : (
        loc.pathname !== "/login" ? <Link to="/login">Login</Link> : null
      )}
    </header>
  );
}

export default function App(){
  return (
    <div style={{maxWidth:1100, margin:'0 auto', padding:24}}>
      <Header/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/products" element={<Products/>}/>
        <Route path="/products/:id" element={<ProductDetail/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Routes>
    </div>
  );
}
