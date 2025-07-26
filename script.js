let reminders = [];

// Function to add a reminder
function addReminder() {
  const name = document.getElementById("medName").value.trim();
  const time = document.getElementById("medTime").value;

  if (!name || !time) {
    alert("Please enter both medicine name and time.");
    return;
  }

  const reminder = { name, time };

  // Save to backend
  fetch("http://localhost:5000/api/reminders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reminder)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Reminder saved successfully");
      reminders.push({ ...reminder, taken: false });
      displayReminders();
      document.getElementById("medName").value = "";
      document.getElementById("medTime").value = "";
    })
    .catch(err => {
      console.error(err);
      alert("Error saving reminder.");
    });
}

// Display reminders in UI
function displayReminders() {
  const list = document.getElementById("reminderList");
  list.innerHTML = "";

  reminders.forEach((reminder, index) => {
    const li = document.createElement("li");
    li.className = "bg-white p-4 rounded shadow-md mb-2 flex justify-between items-center";

    li.innerHTML = `
  <span><strong>${reminder.name}</strong> at ${reminder.time}</span>
  ${reminder.taken
    ? '<span class="ml-4 text-gray-500">✔️ Already Taken</span>'
    : `<button onclick="markAsTaken(${index})" class="bg-green-500 text-white px-2 py-1 rounded">✅ Mark as Taken</button>`
  }
`;


    list.appendChild(li);
  });
}

// Mark reminder as taken
function markAsTaken(index) {
  reminders[index].taken = true;
  alert(`✅ ${reminders[index].name} marked as taken`);
}

// Email missed reminder
function sendMissedEmail(reminder) {
  emailjs.send("service_r712p55", "template_rqceu4c", {
    to_email: "samanvitard@gmail.com",
    message: `You missed your medicine: ${reminder.name} scheduled at ${reminder.time}`
  }).then(() => {
    console.log("📧 Email sent");
  }).catch(err => {
    console.error("❌ Email failed:", err);
  });
}

// Check for missed reminders
function checkMissedReminders() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  reminders.forEach((reminder, index) => {
    if (!reminder.taken && reminder.time === currentTime) {
      alert(`🚨 Missed: ${reminder.name} at ${reminder.time}`);
      sendMissedEmail(reminder);
      reminders[index].taken = true; // Avoid repeated alerts
    }
  });
}

// Load reminders from backend on page load
function loadReminders() {
  fetch("http://localhost:5000/api/reminders")
    .then(res => res.json())
    .then(data => {
      reminders = data;

      displayReminders();
    })
    
    .catch(err => {
      console.error("Error loading reminders:", err);
    });
}

// Run on page load
window.onload = () => {
  loadReminders();
  setInterval(checkMissedReminders, 60000); // Check every 60 sec
};

// Initialize EmailJS
(function() {
  emailjs.init("-loHbdHw0Erg9Gq_t");
})();
