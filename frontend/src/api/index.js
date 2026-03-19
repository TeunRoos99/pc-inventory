import axios from 'axios';

const api = {
  get: (url) => axios.get(url).then(r => r.data),
  post: (url, data) => axios.post(url, data).then(r => r.data),
  put: (url, data) => axios.put(url, data).then(r => r.data),
  delete: (url) => axios.delete(url).then(r => r.data),
};

export default api;
