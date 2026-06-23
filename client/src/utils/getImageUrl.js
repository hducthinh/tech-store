export const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5000';
  return `${baseUrl}${url}`;
};
