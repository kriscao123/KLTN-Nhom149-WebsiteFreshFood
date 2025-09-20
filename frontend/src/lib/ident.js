export const isEmail = (s) => /\S+@\S+\.\S+/.test(s);
export const isPhone = (s) => /^[+\d][\d\s\-().]{6,}$/.test(s);

// Chuyển identifier thành payload phù hợp cho BE
export function identToPayload(identifier) {
  if (isEmail(identifier)) return { email: identifier.trim().toLowerCase() };
  if (isPhone(identifier)) return { phone_number: identifier.trim() };
  throw new Error("Định dạng không hợp lệ. Hãy nhập email hoặc số điện thoại.");
}
