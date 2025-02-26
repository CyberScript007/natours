import axios from 'axios';
import { showAlert } from './showAlert';

export const updateUserSettings = async function (data, type) {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:4000/api/v1/users/updateUserPassword'
        : 'http://127.0.0.1:4000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `User ${type === 'password' ? 'password' : 'data'} successfully updated`,
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
