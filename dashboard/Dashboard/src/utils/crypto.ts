import crypto from 'crypto';

function generateHmacBase64(secretKey: string, data: string): string {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(data);
  return hmac.digest('base64');
}

export { generateHmacBase64 };
