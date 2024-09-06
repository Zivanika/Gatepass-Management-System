document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const BaseURL = `http://localhost:5000`;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch(`${BaseURL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
  
      const data = await response.json();
      console.log(data);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userID', data.user);
        window.location.href = 'gatepasses.html';
      } else {
        alert('Invalid login credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  });
  
  