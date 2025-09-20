import React from "react";
import { clearToken, getToken } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Profile(){
  const nav = useNavigate();
  const token = getToken();
  return (
    <div className="auth-card">
      <h2>Hồ sơ</h2>
      {token ? (
        <>
          <p>Đã đăng nhập (token lưu trong localStorage).</p>
          <button onClick={()=>{ clearToken(); nav("/login"); }}>Đăng xuất</button>
        </>
      ) : (
        <p>Chưa đăng nhập.</p>
      )}
    </div>
  );
}
