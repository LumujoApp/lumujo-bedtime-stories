document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('storyForm');
  const loading = document.getElementById('loading');
  const result = document.getElementById('storyResult');
  const storyBody = document.getElementById('storyBody');

  // --- 1. CREDIT & PAYMENT STATE ---
  let credits = parseInt(localStorage.getItem('lumujo_credits') || '1', 10);
  let isUnlimited = localStorage.getItem('lumujo_unlimited') === 'true';

  function updateBadgeUI() {
    const badge = document.getElementById('creditBadge');
    if (!badge) return;

    if (isUnlimited) {
      badge.innerText = 'Monthly Unlimited Active ✨';
    } else if (credits > 0) {
      badge.innerText = `Stories Remaining: ${credits}`;
    } else {
      badge.innerText = '0 Stories Remaining (Upgrade Below)';
    }
  }

  // --- 2. STRIPE PAYMENT RETURN HANDLER ---
  function checkStripeReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const planType = urlParams.get('type');

    if (paymentStatus === 'success') {
      if (planType === 'pack10') {
        credits += 10;
        localStorage.setItem('lumujo_credits', credits);
        alert('🎉 Thank you! 10 new bedtime stories have been added to your balance.');
      } else if (planType === 'unlimited') {
        isUnlimited = true;
        localStorage.setItem('lumujo_unlimited', 'true');
        alert('🎉 Welcome to Lumujo Monthly Unlimited Pass!');
      }

      // Refresh UI badge
      updateBadgeUI();

      // Clean URL parameters so page refreshes don't re-trigger credits
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // Run immediately on page load
  updateBadgeUI();
  checkStripeReturn();

  // --- 3. SAFETY CONTENT CHECK ---
  const blockedKeywords = [
    "fuck", "shit", "bitch", "asshole", "dick", "pussy", "sexy", "naked", "porn",
    "kill", "murder", "blood", "stab", "shoot", "death", "die", "punch", "fight", "war", "execute"
  ];

  function containsInappropriateContent(text) {
    if (!text) return false;
    const cleanedText = text.toLowerCase().trim();
    return blockedKeywords.some(badWord => cleanedText.includes(badWord));
  }

  // --- 4. MODAL HELPERS ---
  function showPaywallModal() {
    const modal = document.getElementById('paywallModal');
    if (modal) {
      modal.classList.add('active');
    } else {
      alert("You've used all your free stories! Please upgrade to continue.");
    }
  }

  // --- 5. STORY GENERATION HANDLER ---
  async function generateStory(event) {
    event.preventDefault();

    // Paywall Enforcement Check
    if (!isUnlimited && credits <= 0) {
      showPaywallModal();
      return;
    }

    const character = document.getElementById("characterName")?.value || "";
    const companion = document.querySelector("select")?.value || "a friend";
    const level = document.querySelectorAll("select")[1]?.value || "bedtime reading";
    const moral = document.querySelectorAll("select")[2]?.value || "kindness";

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
      
      if (data && data.story) {
        if (storyBody) storyBody.innerText = data.story;

        // Deduct 1 credit upon successful generation if not on unlimited plan
        if (!isUnlimited) {
          credits = Math.max(0, credits - 1);
          localStorage.setItem('lumujo_credits', credits.toString());
          updateBadgeUI();
        }

      } else if (data && data.error) {
        if (storyBody) {
          storyBody.innerText = `Backend Config Error: ${data.error}. (Did you add your AI_API_KEY to Netlify environment variables yet?)`;
        }
      } else {
        if (storyBody) {
          storyBody.innerText = "The AI endpoint is setting up. Make sure your Netlify environment key is active!";
        }
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
