import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Products(){
  const [items, setItems] = useState([])
  useEffect(()=>{
    axios.get(`${API}/api/products`).then(r=>setItems(r.data))
  },[])
  return <>
    <h3>Products</h3>
    <ul>
      {items.map(p => <li key={p._id}><Link to={`/products/${p._id}`}>{p.title}</Link></li>)}
    </ul>
  </>
}
