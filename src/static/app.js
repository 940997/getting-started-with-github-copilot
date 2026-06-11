document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  async function unregisterParticipant(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        fetchActivities();
      } else {
        showMessage(result.detail || "Unable to remove participant", "error");
      }
    } catch (error) {
      showMessage("Failed to remove participant. Please try again.", "error");
      console.error("Error unregistering participant:", error);
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select to avoid duplicated options on re-fetch
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <strong>Participants:</strong>
            <ul class="participants-list">
              ${details.participants.length > 0
                ? details.participants
                    .map(
                      (participant) =>
                        `<li><span>${participant}</span><button class="remove-participant" data-activity="${name}" data-email="${participant}">×</button></li>`
                    )
                    .join("")
                : `<li><em>No participants signed up yet.</em></li>`}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        activityCard.querySelectorAll(".remove-participant").forEach((button) => {
          button.addEventListener("click", () => {
            const activityName = button.dataset.activity;
            const email = button.dataset.email;
            unregisterParticipant(activityName, email);
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        // Update the UI immediately by re-fetching activities and
        // also attempt a targeted DOM update for responsiveness.
        fetchActivities();
        try {
          // Optimistically update the matching activity card if present
          const cards = Array.from(document.querySelectorAll('.activity-card'));
          const card = cards.find(c => c.querySelector('h4') && c.querySelector('h4').textContent === activity);
          if (card) {
            const participantsList = card.querySelector('.participants-list');
            const existing = Array.from(participantsList.querySelectorAll('span')).map(s => s.textContent);
            if (!existing.includes(email)) {
              const li = document.createElement('li');
              const span = document.createElement('span');
              span.textContent = email;
              const btn = document.createElement('button');
              btn.className = 'remove-participant';
              btn.dataset.activity = activity;
              btn.dataset.email = email;
              btn.textContent = '×';
              li.appendChild(span);
              li.appendChild(btn);
              participantsList.appendChild(li);
              // rebind remove handler
              btn.addEventListener('click', () => unregisterParticipant(activity, email));
            }
            // update availability text
            const avail = card.querySelector('p strong');
            // find the availability paragraph (contains 'Availability:')
            const paras = Array.from(card.querySelectorAll('p'));
            const availPara = paras.find(p => p.textContent.includes('Availability'));
            if (availPara) {
              const partsLeft = parseInt(availPara.textContent.match(/(\d+) spots left/)?.[1] || '0', 10);
              const newLeft = Math.max(0, partsLeft - 1);
              availPara.innerHTML = `<strong>Availability:</strong> ${newLeft} spots left`;
            }
          }
        } catch (e) {
          // ignore optimistic update errors; fetchActivities will refresh UI
        }
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
