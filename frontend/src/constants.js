// export const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
export const BASE_URL = ''; // Để trống nếu đã cấu hình Proxy
export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders'; // 👈 Dòng quan trọng cần có
export const PAYPAL_URL = '/api/config/paypal';
export const UPLOAD_URL = '/api/upload';