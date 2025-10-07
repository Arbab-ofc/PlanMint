
export function validatePassword(password) {
  const passwordStr = String(password);

 
  if (passwordStr.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long"
    };
  }

  
  if (!/[A-Z]/.test(passwordStr)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter"
    };
  }

  
  if (!/[a-z]/.test(passwordStr)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter"
    };
  }

  
  if (!/[0-9]/.test(passwordStr)) {
    return {
      isValid: false,
      message: "Password must contain at least one number"
    };
  }

  
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(passwordStr)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)"
    };
  }

  return {
    isValid: true,
    message: "Password is valid"
  };
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(String(email).toLowerCase());
}

export function validateUsername(username) {
  const usernameRegex = /^[a-z0-9](?:[a-z0-9_]{1,18}[a-z0-9])?$/;
  return usernameRegex.test(String(username).toLowerCase());
}

export default {
  validatePassword,
  validateEmail,
  validateUsername
};
