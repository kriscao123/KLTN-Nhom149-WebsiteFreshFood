import React, { useState } from "react";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import Notice from "../compoments/Notice";
import { identToPayload } from "../lib/ident";

export default function Register() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);                 // 1: nhập identifier, 2: OTP, 3: name+password
  const [identifier, setIdentifier] = useState("");    // 1 ô chung
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [profile, setProfile] = useState({ name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const requestOtp = async (e) => {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const idPayload = identToPayload(identifier);
      await api("/api/auth/request-otp", { method: "POST", body: { identifier, purpose: "register", ...idPayload } });
      setMsg("✅ OTP đã được gửi. Hãy kiểm tra email/SMS của bạn.");
      setStep(2);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const data = await api("/api/auth/verify-otp", { method: "POST", body: { identifier, code: otp } });
      setOtpToken(data.otpToken);
      setMsg("✅ Xác thực OTP thành công. Vui lòng tạo mật khẩu.");
      setStep(3);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const register = async (e) => {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      await api("/api/auth/register", { method: "POST", body: { otpToken, ...profile } });
      setMsg("🎉 Đăng ký thành công. Chuyển sang trang đăng nhập...");
      setTimeout(()=> nav("/login"), 800);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container-center">
      <div className="auth-card">
        <h2 className="auth-title">Đăng ký</h2>
        <Notice type={err ? "error" : "info"} text={err || msg} />

        {step === 1 && (
          <form onSubmit={requestOtp} className="form" style={{marginTop:12}}>
            <label>Email hoặc SĐT
              <input value={identifier} onChange={e=>setIdentifier(e.target.value)} required
                     placeholder="vd: user@gmail.com hoặc +8490xxxxxxx"/>
            </label>
            <button disabled={loading}>{loading ? "Đang gửi OTP..." : "Gửi OTP"}</button>
            <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp} className="form" style={{marginTop:12}}>
            <label>Nhập mã OTP
              <input value={otp} onChange={e=>setOtp(e.target.value)} required/>
            </label>
            <div style={{display:"flex", gap:8}}>
              <button disabled={loading} type="submit">{loading ? "Đang xác thực..." : "Xác thực OTP"}</button>
              <button type="button" onClick={()=>setStep(1)}>← Quay lại</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={register} className="form" style={{marginTop:12}}>
            <label>Họ tên
              <input value={profile.name} onChange={e=>setProfile({...profile, name:e.target.value})} required/>
            </label>
            <label>Mật khẩu
              <input type="password" value={profile.password}
                     onChange={e=>setProfile({...profile, password:e.target.value})} required/>
            </label>
            <button disabled={loading}>{loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
