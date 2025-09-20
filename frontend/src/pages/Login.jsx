import React, { useState } from "react";
import { api, setToken } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import Notice from "../compoments/Notice";
import { identToPayload } from "../lib/ident";

export default function Login() {
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");   // 1 ô chung
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const idPayload = identToPayload(identifier);
      const data = await api("/api/auth/login", {
        method: "POST",
        body: { ...idPayload, password }
      });
      setToken(data.token);
      setMsg("✅ Đăng nhập thành công. Đang chuyển trang...");
      setTimeout(()=> nav("/profile"), 600);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-center">
      <div className="auth-card">
        <h2 className="auth-title">Đăng nhập</h2>
        <Notice type={err ? "error" : "info"} text={err || msg} />

        <form onSubmit={submit} className="form" style={{marginTop:12}}>
          <label>Email hoặc SĐT
            <input value={identifier} onChange={e=>setIdentifier(e.target.value)} required
                   placeholder="vd: user@gmail.com hoặc +8490xxxxxxx"/>
          </label>
          <label>Mật khẩu
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
          </label>
          <button disabled={loading}>{loading ? "Đang vào..." : "Đăng nhập"}</button>
        </form>

        <p style={{marginTop:12}}>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
      </div>
    </div>
  );
}
