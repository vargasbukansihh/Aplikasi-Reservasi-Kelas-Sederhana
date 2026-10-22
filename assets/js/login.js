(function () {
  'use strict';

  var form = document.getElementById('form-login');
  var identity = document.getElementById('identitas-login');
  var password = document.getElementById('password-login');
  var message = document.getElementById('pesan-login');
  var passwordToggle = document.getElementById('toggle-password-login');

  passwordToggle.addEventListener('click', function () {
    var isVisible = password.type === 'text';
    password.type = isVisible ? 'password' : 'text';
    passwordToggle.setAttribute('aria-pressed', String(!isVisible));
    passwordToggle.setAttribute(
      'aria-label',
      isVisible ? 'Tampilkan password' : 'Sembunyikan password'
    );
    passwordToggle.querySelector('i').className = isVisible
      ? 'fa-solid fa-eye'
      : 'fa-solid fa-eye-slash';
  });

  function clearInvalid(field) {
    field.classList.remove('is-invalid');
  }

  [identity, password].forEach(function (field) {
    field.addEventListener('input', function () {
      clearInvalid(field);
      message.hidden = true;
      message.textContent = '';
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var firstInvalid = null;
    [identity, password].forEach(function (field) {
      var value = field.value.trim();
      if (!value) {
        field.classList.add('is-invalid');
        firstInvalid = firstInvalid || field;
      } else {
        clearInvalid(field);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    message.textContent = 'Autentikasi belum tersedia untuk formulir ini.';
    message.hidden = false;
  });

  document.getElementById('lupa-password').addEventListener('click', function () {
    message.textContent = 'Pemulihan password belum tersedia.';
    message.hidden = false;
  });
})();
