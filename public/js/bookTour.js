import axios from 'axios';
import { showAlert } from './showAlert';

export const bookTourFunc = async function (tourId) {
  console.log(tourId);
  try {
    const res = await axios.get(
      `http://127.0.0.1:4000/api/v1/booking/checkout-session/${tourId}`,
    );

    window.location.assign(res.data.data.meta.authorization.redirect);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
