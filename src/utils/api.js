// src/utils/api.js
// Bu dosya, projede tekrar eden API çağrılarını ve hata yönetimini merkezi olarak yönetmek için oluşturulmuştur.
// Tüm axios/fetch işlemleri ve hata yönetimi burada fonksiyonel olarak toplanır.

import axios from 'axios';

// Backend API base url
const API_BASE = 'http://localhost:5220';

// Axios instance ile baseURL ayarla
const api = axios.create({
  baseURL: API_BASE
});

/**
 * API'ye yetkili GET isteği atar.
 * @param {string} url - İstek yapılacak endpoint.
 * @returns {Promise<any>} - API'den dönen veri.
 */
export const apiGet = async (url, config = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { ...(config.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await api.get(url, { ...config, headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * API'ye yetkili POST isteği atar.
 * @param {string} url - İstek yapılacak endpoint.
 * @param {object|FormData} data - Gönderilecek veri.
 * @returns {Promise<any>} - API'den dönen veri.
 */
export const apiPost = async (url, data, config = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { ...(config.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const isFormData = (typeof FormData !== 'undefined') && data instanceof FormData;
    if (isFormData && headers['Content-Type']) {
      delete headers['Content-Type'];
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const response = await api.post(url, data, { ...config, headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * API'ye yetkili PUT isteği atar.
 * @param {string} url - İstek yapılacak endpoint.
 * @param {object} data - Gönderilecek veri.
 * @returns {Promise<any>} - API'den dönen veri.
 */
export const apiPut = async (url, data, config = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { ...(config.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await api.put(url, data, { ...config, headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * API'ye yetkili DELETE isteği atar.
 * @param {string} url - İstek yapılacak endpoint.
 * @param {object} [data] - Opsiyonel olarak gönderilecek veri.
 * @returns {Promise<any>} - API'den dönen veri.
 */
export const apiDelete = async (url, data, config = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { ...(config.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await api.delete(url, { ...config, headers, data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * API hatalarını okunabilir hale getirir.
 * @param {any} error - Axios veya fetch hatası.
 * @returns {string} - Okunabilir hata mesajı.
 */
export const parseApiError = (error) => {
  if (error.response && error.response.data) {
    if (typeof error.response.data === 'string') return error.response.data;
    if (error.response.data.errors) {
      return Object.values(error.response.data.errors).flat().join(' ');
    }
    if (error.response.data.message) return error.response.data.message;
    if (error.response.data.title) return error.response.data.title;
    // Tüm string değerleri tara
    for (const key in error.response.data) {
      if (typeof error.response.data[key] === 'string') return error.response.data[key];
    }
  }
  return error.message || 'Bilinmeyen bir hata oluştu.';
}; 