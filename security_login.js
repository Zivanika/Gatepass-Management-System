document.getElementById('security-login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const BaseURL = `http://localhost:5000`;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch(`${BaseURL}/api/securitylogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
  
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('stoken', data.token);
        window.location.href = 'approvegatepasses.html';
      } else {
        alert('Invalid login credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  });
  
  