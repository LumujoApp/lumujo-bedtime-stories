document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('storyForm');
  const loading = document.getElementById('loading');
  const result = document.getElementById('storyResult');
  const submitBtn = document.getElementById('submitBtn');

  const blockedKeywords = [
    "fuck", "shit", "bitch", "asshole", "dick", "pussy", "sexy", "naked", "porn",
    "kill", "murder", "blood", "stab", "shoot", "death", "die", "punch", "fight", "war", "execute"
  ];

  function containsInappropriateContent(text) {
    if (!text) return false;
    const cleanedText = text.toLowerCase().trim();
    return blockedKeywords.some(badWord => cleanedText.includes(badWord));
  }

  async function generateStory(event) {
    event.preventDefault();

    const character = document.getElementById("characterName")?.value || "";
    const companion = document.querySelector("select")?.value || "a friend";
    const level = document.querySelectorAll("select")[1]?.value || "bedtime reading";
    const moral = document.querySelectorAll("select")[2]?.value || "kindness";
    const storyBody = document.getElementById("storyBody");

    if (containsInappropriateContent(character)) {
      alert("Please keep the character name friendly!");
      return;
    }

    if (loading) loading.classList.remove("hidden");
    if (result) result.classList.add("hidden");

    try {
      const response = await fetch("/.netlify/functions/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character, companion, level, moral })
      });

      const data = await response.json();
      
      // Safety check: if backend sent an error or missing story, show a fallback
      if (data && data.story) {
        storyBody.innerText = data.story;
      } else if (data && data.error) {
        storyBody.innerText = `Backend Config Error: ${data.error}. (Did you add your AI_API_KEY to Netlify environment variables yet?)`;
      } else {
        storyBody.innerText = "The AI endpoint is setting up. Make sure your Netlify environment key is active!";
      }
      
      if (result) result.classList.remove("hidden");
    } catch (error) {
      if (storyBody) {
        storyBody.innerText = "Could not reach the serverless backend. Check your Netlify deployment log.";
      }
      if (result) result.classList.remove("hidden");
    } finally {
      if (loading) loading.classList.add("hidden");
    }
  }

  if (form) form.addEventListener('submit', generateStory);
});
