const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

loginBtn?.addEventListener("click",async () => {
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    if(!emailInput || !passwordInput){
        console.error("Inputs not found on page");
        return;
    }
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if(!email||!password){
        loginMessage.textContent = "Please enter both email and password";
        return;
    }
    try{
        const response = await fetch("http://localhost:3000/api/clinician/login",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password })
        });
        const data = await response.json
        if (!response.ok){
            loginMessage.textContent = "Unable to sign in."
            return;
        }
        localStorage.setItem("clinicianApiKey", data.userApiKey);
        window.location.href = "dashboard.html";
    } catch (error) {
        loginMessage.textContent = "Unable to sign in.";
        console.error(error);
    }
});