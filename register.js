document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const BaseURL = `http://localhost:5000`;
    const form = document.getElementById('register-form');
    const formData = new FormData(form);
    try {
      const response = await fetch(`${BaseURL}/api/register`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        alert('Registration successful!');
        window.location.href = 'login.html';
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  });
  