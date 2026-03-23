const patientList = document.getElementById("patientList");
const patientCards = document.querySelectorAll(".patient-card");
const selectedPatientEmail = document.getElementById("selectedPatientEmail");
const logoutBtn = document.getElementById("logoutBtn");

const patientHeartRate = document.getElementById("patientHeartRate");
const patientSteps = document.getElementById("patientSteps");
const patientBp = document.getElementById("patientBp");
const patientCalories = document.getElementById("patientCalories");

const graphTitle = document.getElementById("graphTitle");
const graphSubtitle = document.getElementById("graphSubtitle");
const graphRangeButtons = document.querySelectorAll(".graphRangeBtn");
const graphCanvas = document.getElementById("clinicianBiomarkerGraph");

const appointmentPurpose = document.getElementById("appointmentPurpose");
const appointmentLocation = document.getElementById("appointmentLocation");
const appointmentDatetime = document.getElementById("appointmentDatetime");
const appointmentRequirements = document.getElementById("appointmentRequirements");
const appointmentNotes = document.getElementById("appointmentNotes");
const createAppointmentBtn = document.getElementById("createAppointmentBtn");
const appointmentMessage = document.getElementById("appointmentMessage");

const clinicianApiKey = localStorage.getItem("clinicianApiKey");

let selectedPatientId = null;
let selectedBiomarkerType = 0 // 0 for HR, 1 for steps, 2 bp, 3 cals
let selectedDateFrame = "7d";
let clinicianChart = null;

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
            body: JSON.stringify({ userApiKey: clinicianApiKey })
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
    button.dataset.email = patient.email;

    button.innerHTML = `
      <div class="patient-card-name">${patient.name || patient.emailAddress || "Unknown Patiemnt"}</div>
      <div class="patient-card-sub">${patient.summary || "View biomarker data"}</div>
    `;

    button.addEventListener("click", () => {
      document.querySelectorAll(".patient-card").forEach(c => c.classList.remove("active"));
      button.classList.add("active");

      selectedPatientEmail.textContent = patient.email;

      selectedPatientId = patient.userId;
      loadPatientBiomarkers(patient.userId);
      loadGraphData(patient.userId, selectedBiomarkerType, selectedDateFrame);    });

    patientList.appendChild(button);
  });

  if (patients.length > 0) {
    const first = patients[0];
    selectedPatientEmail.textContent = first.emailAddress || "Unknown Patient";
    selectedPatientId = first.userId;
    loadPatientBiomarkers(selectedPatientId);
    loadGraphData(first.userId, selectedBiomarkerType, selectedDateFrame);
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
async function loadGraphData(patientId, type, dateFrame){
    try {
        console.log("Sending graph request:", {patientId, type, dateFrame});
        const response = await fetch("http://localhost:3000/api/clinician/patient/graph", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userApiKey: clinicianApiKey,
                patientId,
                type,
                dateFrame
            })
        });
        const data = await response.json();

        if(!response.ok || !data.data){
            renderEmptyChart();
            return;
        }
        renderChart(type,data.data);
    } catch (error){
        console.error(error);
        renderEmptyChart();
    }
}
function renderChart(type, graphData){
    const ctx = graphCanvas.getContext("2d");

    if(clinicianChart) {
        clinicianChart.destroy();
    }
    if(!graphData.length){
        renderEmptyChart();
        return;
    }
    if (type === 2){
        graphTitle.textContent = "Blood Pressure Trends";
        graphSubtitle.textContent = "Systolic and diastolic readings over time";

        clinicianChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: graphData.map(item => item.label),
                datasets: [
                    {
                        label: "Systolic",
                        data: graphData.map(item => item.systolic),
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: "Diastolic",
                        data: graphData.map(item => item.diastolic),
                        borderWidth: 2,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        return;
    }
    let label = "Heart Rate";
    if (type === 1) label = "Steps";
    if (type === 3) label = "Calories";
    if (label == "Heart Rate") graphData.sort((a, b) => parseGraphLabelToDate(a.label) - parseGraphLabelToDate(b.label));

    graphTitle.textContent = `${label} Trends`;
    graphSubtitle.textContent = `Recent ${label.toLowerCase()} readings`;
    clinicianChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: graphData.map(item => item.label),
            datasets: [
                {
                    label,
                    data: graphData.map(item => item.value),
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
function renderEmptyChart() {
    const ctx = graphCanvas.getContext("2d");

    if (clinicianChart) {
        clinicianChart.destroy();
    }

    graphTitle.textContent = "Biomarker Trends";
    graphSubtitle.textContent = "No graph data available";

    clinicianChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "No data",
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
function parseGraphLabelToDate(label) {
    const [datePart, timePart] = label.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute);
}
document.querySelectorAll(".bioCard").forEach((card,index) => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".bioCard").forEach(c => c.classList.remove("bioCard--active"));
        card.classList.add("bioCard--active");

        selectedBiomarkerType = index;

        if(selectedPatientId){
            loadGraphData(selectedPatientId,selectedBiomarkerType, selectedDateFrame);
        }
    });
});
graphRangeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        graphRangeButtons.forEach(btn => btn.classList.remove("graphRangeBtn--active"));
        button.classList.add("graphRangeBtn--active");

        selectedDateFrame = button.dataset.range;

        console.log("Range changed to:", selectedDateFrame); // debug

        if (selectedPatientId) {
            loadGraphData(selectedPatientId, selectedBiomarkerType, selectedDateFrame);
        }
    });
});
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("clinicianApiKey");
  localStorage.removeItem("clinicianEmail");
  window.location.href = "index.html";
});

createAppointmentBtn?.addEventListener("click", async() => {
    if (!selectedPatientId) {
        appointmentMessage.textContent = "Please select a patient first.";
        return;
    }

    const purpose = appointmentPurpose.value.trim(); 
    const location = appointmentLocation.value.trim();
    const datetime = appointmentDatetime.value.trim();
    const requirements = appointmentRequirements.value.trim();
    const notes = appointmentNotes.value.trim();

    if (!purpose || !location || !datetime) {
        appointmentMessage.textContent = "Purpose, location, and date/time are required";
        return;
    }

    try{
        const response = await fetch("http://localhost:3000/api/clinician/appointment/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userApiKey: clinicianApiKey,
                patientId: selectedPatientId,
                purpose,
                location,
                datetime,
                requirements,
                notes
            })
        });
        const data = await response.json();
        if (!response.ok){
            appointmentMessage.textContent = data.message || "Unable to create appointment";
            return;
        }
        appointmentMessage.textContent = "Appointment created successfully.";
        
        appointmentPurpose.value = "";
        appointmentLocation.value = "";
        appointmentDatetime.value = "";
        appointmentRequirements.value = "";
        appointmentNotes.value = ""

    } catch (error){
        console.error(error);
        appointmentMessage.textContent = "Unable to create appointment";
    }
});

loadPatients();