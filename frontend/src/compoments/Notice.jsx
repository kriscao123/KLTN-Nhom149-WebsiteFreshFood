import React from "react";

export default function Notice({ type="info", text="" }) {
  if (!text) return null;
  const color = type==="error" ? "#d33" : type==="success" ? "#2f8f2f" : "#2f6fed";
  const bg = type==="error" ? "#fdeaea" : type==="success" ? "#eafdea" : "#eaf0fe";
  return (
    <div style={{
      background:bg, border:`1px solid ${color}33`, color, padding:"10px 12px",
      borderRadius:8, fontSize:14
    }}>
      {text}
    </div>
  );
}
