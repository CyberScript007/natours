import { login, logout } from './login';
import { updateUserSettings } from './updateSettings';
import { bookTourFunc } from './bookTour';
import { mapLayer } from './map';
import 'leaflet';

const loginUserForm = document.querySelector('.form--login');
const logoutUser = document.querySelector('.nav__el--logout');
const updateUserData = document.querySelector('.form-user-data');
const updateUserPasswordSettings = document.querySelector(
  '.form-user-settings',
);
const bookTourBtn = document.getElementById('bookTour');

// get the locations from the map
const mapContainer = document.getElementById('map');

if (mapContainer) {
  const locations = JSON.parse(mapContainer.dataset.locations);
  mapLayer(locations);
}

if (loginUserForm) {
  loginUserForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logoutUser) {
  logoutUser.addEventListener('click', logout);
}

if (updateUserData) {
  updateUserData.addEventListener('submit', function (e) {
    e.preventDefault();
    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateUserSettings(form);
  });
}

if (updateUserPasswordSettings) {
  updateUserPasswordSettings.addEventListener('submit', function (e) {
    e.preventDefault();
    const oldPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    updateUserSettings({ oldPassword, password, passwordConfirm }, 'password');
    this.reset();
  });
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', function (e) {
    const { tourId } = e.target.dataset;
    console.log(tourId);

    bookTourFunc(tourId);
  });
}
