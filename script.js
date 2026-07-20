document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('storyForm');
  const loading = document.getElementById('loading');
  const result = document.getElementById('storyResult');
  const paymentGate = document.getElementById('paymentGate');
  const submitBtn = document.getElementById('submitBtn');

  // Track state conditions dynamically
  let storyCount = 0;
  let maxStoriesAllowed = 1; // Default free limit

  // --- Safety Filter Rule List ---
  const blockedKeywords = [
    "fuck", "shit", "bitch", "asshole", "dick", "pussy", "sexy", "naked", "porn",
    "kill", "murder", "blood", "stab", "shoot", "death", "die", "punch", "fight", "war", "execute",
    "monster", "demon", "ghost", "corpse", "hell", "satan", "terror", "creepy", "scary"
  ];

  function containsInappropriateContent(text) {
    if (!text) return false;
    const cleanedText = text.toLowerCase().trim();
    return blockedKeywords.some(badWord => cleanedText.includes(badWord));
  }

  async function generateStory(event) {
    event.preventDefault();

    // 1. Grab input values
    const character = document.getElementById("characterName")?.value || "";
    const companion = document.querySelector("select")?.value || "a friend";
    const level = document.querySelectorAll("select")[1]?.value || "bedtime reading";
    const moral = document.querySelectorAll("select")[2]?.value || "kindness";

    const storyBody = document.getElementById("storyBody");

    // 2. Run the Safety Check on user-typed text
    if (containsInappropriateContent(character)) {
      alert("Please keep the character name friendly and appropriate for a bedtime story!");
      return;
    }

    // 3. Show loading screen, hide old results
    if (loading) loading.classList.remove("hidden");
    if (result) result.classList.add("hidden");

    try {
      // 4. Send directly to your secure Netlify serverless function
      const response = await fetch("/.netlify/functions/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character, companion, level, moral })
      });

      const data = await response.json();
      
      // 5. Display the deep, human-sounding AI story
      if (storyBody) {
        storyBody.innerText = data.story;
      }
      if (result) result.classList.remove("hidden");
    } catch (error) {
      if (storyBody) {
        storyBody.innerText = "The stars are a bit tangled right now. Please try again in a moment!";
      }
      if (result) result.classList.remove("hidden");
    } finally {
      if (loading) loading.classList.add("hidden");
    }
  }

  // Attach execution handler to form submit
  if (form) {
    form.addEventListener('submit', generateStory);
  }
});
