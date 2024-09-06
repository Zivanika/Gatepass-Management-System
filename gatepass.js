document.addEventListener("DOMContentLoaded", function () {
  const gatepassForm = document.getElementById("gatepass-form");
  const gatepassesList = document.getElementById("gatepasses-list");

  // Check if user is logged in
  const token = localStorage.getItem("token");
  const userID = localStorage.getItem("userID");
  if (!token) {
    alert("You need to login first");
    window.location.href = "login.html";
    return;
  }

  function formatDateToDDMMYYYY(isoString) {
    const date = new Date(isoString);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }

  gatepassForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const visitorName = document.getElementById("visitorName").value;
    const dateOfVisit = document.getElementById("dateOfVisit").value;
    const purpose = document.getElementById("purpose").value;
    const designation = document.getElementById("designation").value;
    const department = document.getElementById("department").value;

    const gatepassData = {
      visitorName,
      dateOfVisit,
      purpose,
      designation,
      department,
      userID
    };

    try {
      const response = await fetch("http://localhost:5000/api/gatepasses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(gatepassData),
      });
      console.log(response);
      if (response.ok) {
        alert("Gatepass request submitted successfully");
        loadGatepasses();
        gatepassForm.reset();
      } else {
        alert("Failed to submit gatepass request");
      }
    } catch (error) {
      console.error("Error submitting gatepass request:", error);
    }
  });

  // Function to load gatepasses
  async function loadGatepasses() {
    try {
      const response = await fetch("http://localhost:5000/api/allgatepasses", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (response.ok) {
        const gatepasses = await response.json();
        const userGatepasses = gatepasses.filter(gatepass => gatepass.user_id === parseInt(userID, 10));

        if (userGatepasses.length > 0) {
          renderGatepasses(userGatepasses);
        } else {
          renderNoGatepasses();
      } 
    }
      else {
        renderNoGatepasses();
        // alert("Failed to load gatepasses");
      }
    } catch (error) {
      console.error("Error loading gatepasses:", error);
    }
  }

  // Function to render gatepasses
  function renderGatepasses(gatepasses) {
    gatepassesList.innerHTML = "";
    gatepasses.forEach((gatepass) => {
      if (gatepass.user_id === parseInt(userID, 10)) {
        const gatepassItem = document.createElement("div");
        gatepassItem.classList.add("gatepass-item");
        gatepassItem.innerHTML = `
      <div class="infoContainer">
        <h3>Visitor Gatepass</h3>
        <bold><strong>Registration Number:</strong> ${
          gatepass.registrationNo
          }</bold>
          <p><strong>Visitor Name:</strong> ${gatepass.visitorName}</p>
          <p><strong>Date of Visit:</strong> ${formatDateToDDMMYYYY(
            gatepass.dateOfVisit
            )}</p>
          <p><strong>Purpose:</strong> ${gatepass.purpose}</p>
          <p><strong>Designation:</strong> ${gatepass.designation}</p>
          <p><strong>Department:</strong> ${gatepass.department}</p>
          <p><strong>Status:</strong> ${gatepass.status}</p>
          <p><strong>ID:</strong> ${gatepass.id}</p>
        </div>
        <div class="imgContainer"><strong>Profile Pic:</strong> <img src="${gatepass.profile_pic}" alt="Profile Pic" class="dp"/></div>
       <div class="imgContainer"><strong>ID Proof:</strong> <img src="${gatepass.id_proof}" alt="ID Proof" class="id_proof"/></div>
        `;
        gatepassesList.appendChild(gatepassItem);
      }
    });
  }

  function renderNoGatepasses() {
    gatepassesList.innerHTML = "";
    const Item = document.createElement("div");
    Item.classList.add("no-item");
    Item.innerHTML = `
          <h2>No Gatepasses to display</h2>
        `;
    gatepassesList.appendChild(Item);
  }

  // Load gatepasses on page load
  loadGatepasses();
});
