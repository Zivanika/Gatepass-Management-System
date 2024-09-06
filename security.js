document.addEventListener('DOMContentLoaded', function () {
    const gatepassesList = document.getElementById('gatepasses-list');
  
    // Check if user is logged in
    const token = localStorage.getItem('stoken');
    if (!token) {
      alert('You need to login first');
      window.location.href = 'securitylogin.html';
      return;
    }

    function formatDateToDDMMYYYY(isoString) {
      const date = new Date(isoString);
    
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
    
      return `${day}/${month}/${year}`;
    }
  
    // Function to load gatepasses
    async function loadGatepasses() {
      try {
        const response = await fetch('http://localhost:5000/api/allgatepasses', {
          method: 'GET',
          headers: {
            'Authorization': token
          }
        });
  
        if (response.ok) {
          const gatepasses = await response.json();
          renderGatepasses(gatepasses);
        } else {
          alert('Failed to load gatepasses');
        }
      } catch (error) {
        console.error('Error loading gatepasses:', error);
      }
    }
  
    // Function to render gatepasses
    function renderGatepasses(gatepasses) {
      gatepassesList.innerHTML = '';
      gatepasses.forEach(gatepass => {
        const gatepassItem = document.createElement('div');
        gatepassItem.classList.add('gatepass-item');
        gatepassItem.innerHTML = `
        <div class="infoContainer">
        <h3>Visitor Gatepass</h3>
        <bold><strong>Registration Number:</strong> ${
            gatepass.registrationNo
        }</bold>
        <p><strong>Visitor Name:</strong> ${gatepass.visitorName}</p>
        <p><strong>Date of Visit:</strong> ${formatDateToDDMMYYYY(gatepass.dateOfVisit)}</p>
        <p><strong>Purpose:</strong> ${gatepass.purpose}</p>
        <p><strong>Designation:</strong> ${gatepass.designation}</p>
        <p><strong>Department:</strong> ${gatepass.department}</p>
        <p><strong>Status:</strong> ${gatepass.status}</p>
        <p><strong>User ID:</strong> ${gatepass.id}</p>
        <div class="btnContainer">
        ${gatepass.status === 'Pending' ? 
            `<div id="buttons">
            <button class="approve" data-id="${gatepass.gatepass_id}">Approve</button>
            <button class="reject" data-id="${gatepass.gatepass_id}">Reject</button>
            </div>` : 
            (gatepass.status === 'Approved' ? '<p id="approveText">Approved</p>' : '<p id="rejectText">Rejected</p>')
         }
        </div>
        </div>
        <div class="imgContainer"><strong>Profile Pic:</strong> <img src="${gatepass.profile_pic}" alt="Profile Pic" class="dp"/></div>
        <div class="imgContainer"><strong>ID Proof:</strong> <img src="${gatepass.id_proof}" alt="ID Proof" class="id_proof"/></div>
      `;
        gatepassesList.appendChild(gatepassItem);
      });

      document.querySelectorAll('.approve').forEach(button => {
        button.addEventListener('click', handleApprove);
      });

      document.querySelectorAll('.reject').forEach(button => {
        button.addEventListener('click', handleReject);
      });
    }

    async function handleApprove(event) {
        const id = event.target.dataset.id;
        const buttonDiv = event.target.parentElement;
        try {
          const response = await fetch('http://localhost:5000/api/approve', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id })
          });
      
          const data = await response.json();
          if (response.ok) {
            buttonDiv.innerHTML = '<p id="approveText">Approved</p>';
          } else {
            console.error('Error Approving:', data.message);
          }
        } catch (error) {
          console.error('Error Approving:', error);
        }
      }
  
      async function handleReject(event) {
        const id = event.target.dataset.id;
        const buttonDiv = event.target.parentElement;
        try {
          const response = await fetch('http://localhost:5000/api/reject', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id })
          });
      
          const data = await response.json();
          if (response.ok) {
            buttonDiv.innerHTML = '<p id="rejectText">Rejected</p>';
          } else {
            console.error('Error Rejecting:', data.message);
          }
        } catch (error) {
          console.error('Error Rejecting:', error);
        }
      }
  

    // Load gatepasses on page load
    loadGatepasses();
});
