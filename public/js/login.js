import axios from 'axios';
import { showAlert } from './showAlert';

export const login = async function (email, password) {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:4000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    console.log(res.data);

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      setTimeout(() => {
        window.location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async function () {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:4000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Log out successfully!');
      window.location.assign('/');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
