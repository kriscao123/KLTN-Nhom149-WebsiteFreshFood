import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ProductDetail(){
  const { id } = useParams()
  const [data, setData] = useState(null)
  useEffect(()=>{
    axios.get(`${API}/api/products/${id}`).then(r=>setData(r.data))
  },[id])
  if(!data) return <div>Loading...</div>
  return <>
    <h3>{data.title}</h3>
    <p>{data.description}</p>
    <pre>{JSON.stringify(data.variants, null, 2)}</pre>
  </>
}
