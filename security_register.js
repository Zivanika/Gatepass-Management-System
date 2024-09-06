document.getElementById('security-register-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const BaseURL = `http://localhost:5000`;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
      const response = await fetch(`${BaseURL}/api/securityregister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        alert('Registration successful!');
        window.location.href = 'securitylogin.html';
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  });
  