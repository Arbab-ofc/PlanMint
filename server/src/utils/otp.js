
import crypto from "crypto";

export function generateNumericOTP(length = 6) {
  if (!Number.isInteger(length) || length <= 0) {
    throw new TypeError("length must be a positive integer");
  }
  const max = 10 ** length;
  const n = crypto.randomInt(0, max); 
  return String(n).padStart(length, "0");
}


export function generateOTP() {
  return generateNumericOTP(6);
}

export default generateOTP;
