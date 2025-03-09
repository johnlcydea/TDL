document.addEventListener("DOMContentLoaded", async () => {
  const loginButton = document.querySelector("#login-button");
  const loginForm = document.querySelector("#login-form"); // Select the login form

  // Handle Google login button click
  if (loginButton) {
    loginButton.addEventListener("click", () => {
      console.log("Login button clicked");
      window.location.href = "/auth/google"; // Redirect to Google authentication
    });
  }

  // Handle traditional login form submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Prevent the default form submission

      const email = document.getElementById("email").value; // Get email input value
      const password = document.getElementById("password").value; // Get password input value

      try {
        const response = await fetch("/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }), // Send email and password as JSON
        });

        if (response.ok) {
          // Redirect to the main page or dashboard
          window.location.href = "/";
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Login failed. Please try again."); // Show error message
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert("An error occurred. Please try again later."); // Show generic error message
      }
    });
  }

  // Fetch current user data
  try {
    const userResponse = await fetch("/api/current_user");

    if (userResponse.ok) {
      const text = await userResponse.text(); // Read response as text first

      if (text) {
        const user = JSON.parse(text); // Convert text to JSON if it's not empty

        if (user && user.user !== null) {
          loginButton.style.display = "none"; // Hide login button if user is logged in
          loginForm.style.display = "none"; // Optionally hide the login form
        }
      }
    } else {
      console.warn("User  not authenticated or response not OK");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
});
