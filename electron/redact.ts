const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phoneRegex = /\+?\d?[\d\s().-]{7,}\d/g;

export const redactSensitive = (text: string) => {
  return text
    .replace(emailRegex, "[redacted-email]")
    .replace(phoneRegex, "[redacted-phone]");
};
