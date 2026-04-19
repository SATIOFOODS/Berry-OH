(function initForm() {
  const form    = document.getElementById('apply-form');
  const wrapper = document.getElementById('form-wrapper');
  const success = document.getElementById('form-success');

  if (!form || !wrapper || !success) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name  = form.elements['name'].value.trim();
    const email = form.elements['email'].value.trim();

    if (!name) { form.elements['name'].focus(); return; }

    const emailValid = email.length > 0 && email.includes('@') && email.includes('.');
    if (!emailValid) { form.elements['email'].focus(); return; }

    /* Submit to Formspree */
    const data = new FormData(form);
    try {
      await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });
    } catch (_) { /* fail silently — still show success */ }

    /* Lock wrapper height before removing form so page doesn't jump */
    wrapper.style.minHeight = wrapper.offsetHeight + 'px';

    form.style.transition = 'opacity 0.4s ease';
    form.style.opacity = '0';

    setTimeout(() => {
      form.style.display = 'none';
      success.style.display = 'block';
      void success.offsetWidth;
      success.style.opacity = '1';
    }, 400);
  });
}());
