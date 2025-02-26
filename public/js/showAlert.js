const hideAlert = function () {
  const el = document.querySelector('.alert');
  if (el) el.remove();
};

export const showAlert = function (type, message) {
  hideAlert();
  const markup = `<div class="alert alert--${type}" >${message}</div>`;
  document.body.insertAdjacentHTML('afterbegin', markup);

  setTimeout(() => hideAlert(), 5000);
};
