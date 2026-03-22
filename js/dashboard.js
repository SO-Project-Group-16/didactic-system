const patientCards = document.querySelectorAll(".patient-card");
const selectedPatientName = document.getElementById("selectedPatientName");
const selectedPatientEmail = document.getElementById("selectedPatientEmail");
const logoutBtn = document.getElementById("logoutBtn");

const patientHeartRate = document.getElementById("patientHeartRate");
const patientSteps = document.getElementById("patientSteps");
const patientBp = document.getElementById("patientBp");
const patientCalories = document.getElementById("patientCalories");

const clinicianApiKey = localStorage.getItem("clinicianApiKey");

if (!clinicianApiKey) {
    window.location.href = "index.html";
}

async function loadPatients(){
    try{
        const response = await fetch("http://localhost:3000/api/clinician/patients", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ clinicianId })
        });
        const data = await response.json();
        if (!response.ok){
            patientList.innerHTML = "<p>Unable to load patients.</p>";
            return
        }
        if (!data.patients || data.patients.length === 0){
            patientList.innerHTML = "<p>No patients found</p>"
            return;
        }
        renderPatients(data.patients);

    } catch (error) {
        patientList.innerHTML = "<p>Unable to load patients</p>"
        console.error(error);
    }
}
function renderPatients(patients) {
  patientList.innerHTML = "";

  patients.forEach((patient, index) => {
    const button = document.createElement("button");
    button.className = "patient-card";
    if (index === 0) button.classList.add("active");

    button.dataset.userid = patient.userId;
    button.dataset.name = patient.name;
    button.dataset.email = patient.email;

    button.innerHTML = `
      <div class="patient-card-name">${patient.name}</div>
      <div class="patient-card-sub">${patient.summary}</div>
    `;

    button.addEventListener("click", () => {
      document.querySelectorAll(".patient-card").forEach(c => c.classList.remove("active"));
      button.classList.add("active");

      selectedPatientName.textContent = patient.name;
      selectedPatientEmail.textContent = patient.email;

      // later: fetch biomarker data for this patient here
    });

    patientList.appendChild(button);
  });

  if (patients.length > 0) {
    const first = patients[0];
    selectedPatientName.textContent = first.name || first.emailAddress || "Unknown Patient";
    selectedPatientEmail.textContent = first.email || first.emailAddress || "";
    loadPatientBioMarkers(first.userId);
  }
}
async function loadPatientBiomarkers(userId) {
    try {
        const response = await fetch("http://localhost:3000/api/clinician/patients/dashboard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userApiKey: clinicianApiKey,
                patientId: userId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            patientHeartRate.textContent = "-";
            patientSteps.textContent = "-";
            patientBp.textContent = "-";
            patientCalories.textContent = "-";
            return;
        }

        patientHeartRate.textContent = data.heartRate ? `${data.heartRate} bpm` : "-";
        patientSteps.textContent = data.steps ?? "-";
        patientBp.textContent =
            data.systolic && data.diastolic
                ? `${data.systolic}/${data.diastolic}`
                : "-";
        patientCalories.textContent = data.calories ?? "-";
    } catch (error) {
        patientHeartRate.textContent = "-";
        patientSteps.textContent = "-";
        patientBp.textContent = "-";
        patientCalories.textContent = "-";
        console.error(error);
    }
}

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("clinicianApiKey");
  localStorage.removeItem("clinicianEmail");
  window.location.href = "index.html";
});

loadPatients();