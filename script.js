document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('storyForm');
  const loading = document.getElementById('loading');
  const result = document.getElementById('storyResult');
  const storyBody = document.getElementById('storyBody');

  // --- SAFE LOCALSTORAGE HELPERS (Safari Private Mode Safety) ---
  function getSafeStorage(key, defaultValue) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  function setSafeStorage(key, value) {
    try {
      localStorage.setItem(key, value.toString());
    } catch (e) {
      console.warn('LocalStorage is restricted or in Private Mode.');
    }
  }

  // --- 1. CREDIT & PAYMENT STATE ---
  if (getSafeStorage('lumujo_credits', null) === null) {
    setSafeStorage('lumujo_credits', '1');
  }

  let credits = parseInt(getSafeStorage('lumujo_credits', '1'), 10);
  let isUnlimited = getSafeStorage('lumujo_unlimited', 'false') === 'true';

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
        setSafeStorage('lumujo_credits', credits);
        alert('🎉 Thank you! 10 new bedtime stories have been added to your balance.');
      } else if (planType === 'unlimited') {
        isUnlimited = true;
        setSafeStorage('lumujo_unlimited', 'true');
        alert('🎉 Welcome to Lumujo Monthly Unlimited Pass!');
      }

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

  // Helper to extract values from targeted select/input pairings
  function getValue(selectId, inputId) {
    const select = document.getElementById(selectId);
    const input = document.getElementById(inputId);
    if (select) {
      if (select.value === 'OTHER' && input) {
        return input.value.trim() || 'Custom Option';
      }
      return select.value;
    }
    return '';
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

    // Direct ID selection with fallback defaults
    const character = document.getElementById("heroName")?.value.trim() || document.getElementById("characterName")?.value.trim() || "Explorer";
    const companion = getValue("sidekick", "sidekickOther") || getValue("companionSelect", "companionOther") || "a friendly companion";
    const favoriteToy = getValue("favoriteToy", "favoriteToyOther") || "a special keepsake";
    const level = getValue("readingLevel", "readingLevelOther") || getValue("levelSelect", "levelOther") || "Young Reader (Ages 5-7)";
    const moral = getValue("moralTopic", "moralTopicOther") || getValue("moralSelect", "moralOther") || "kindness";

    const allInputs = `${character} ${companion} ${favoriteToy} ${level} ${moral}`;
    if (containsInappropriateContent(allInputs)) {
      alert("Please keep all character names and details friendly and gentle!");
      return;
    }

    // Enhanced Prompt Construction
    const prompt = `You are a gentle, wholesome, and child-safe bedtime story writer.

ORIGINALITY & UNIQUENESS:
- Generate a completely 100% unique, original story each time this prompt is called.
- Do NOT repeat story plots, openings, or repetitive tropes—create fresh dialogue, scenarios, and imaginative details every time.

STRICT OUTPUT FORMAT:
- Return ONLY the story text itself.
- Do NOT include story titles, headers, introductory greetings ("Here is your story:"), or closing notes.

STRICT SAFETY & CONTENT GUARANTEES:
- This story MUST be completely safe, comforting, positive, and age-appropriate.
- Absolutely NO violence, gore, weapons, fear, jump-scares, dark themes, or adult content under any circumstances.
- If any input seems questionable, ignore negative undertones and turn it into a peaceful, gentle, happy story element.

STORY PARAMETERS:
Main Character: ${character}
Companion: ${companion}
Special Toy / Item: ${favoriteToy}
Complexity Level / Constraints: ${level}
Lesson/Moral: ${moral}

AGE & COMPLEXITY CONSTRAINTS (STRICT ENFORCEMENT REQUIRED):
- Adapt sentence structure, vocabulary, and length DIRECTLY to the specified complexity level (${level}).

IF LEVEL IS "Early Listener" OR "Ages 2-4":
- WORD COUNT: Maximum 100 to 140 words total.
- VOCABULARY: Use ONLY basic 1-to-2 syllable words that a 2-year-old understands (e.g., sun, star, bear, cozy, warm, soft, happy, sleepy, night, hug).
- SENTENCE LENGTH: Max 5 to 7 words per sentence.
- BANNED WORDS: DO NOT use words like "adventure", "journey", "enchanted", "magnificent", "curious", "expedition", "discover", "marvelous", or "courageous".
- STYLE: Simple repetition, gentle rhythm, soft sensory sounds, and calm pacing.

IF LEVEL IS "Young Reader" OR "Ages 5-7":
- WORD COUNT: ~200 to 250 words max. Short sentences, playful language, easy-to-follow plots.

IF LEVEL IS "Imaginative Learner" OR "Ages 8+":
- WORD COUNT: ~350 to 450 words. Richer descriptive sentences and deeper storylines.

IF LEVEL IS "Adult" OR "Ages 18+" OR "25 Years Old":
- WORD COUNT: ~450 to 600 words.
- TONE & VOCABULARY: Atmospheric, cozy, and sophisticated. Focus on stress relief, peaceful imagery, sensory wind-down details, and unhurried pacing. Avoid juvenile tropes.

CONCLUSION:
- ALWAYS end with a peaceful, sleepy conclusion where ${character} falls asleep safely, cozy, and warm in bed.`;

    if (loading) loading.classList.remove("hidden");
    if (result) result.classList.add("hidden");

    try {
      const response = await fetch("https://lumujo-bedtime-stories.netlify.app/.netlify/functions/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          character, 
          companion, 
          favoriteToy,
          level, 
          moral 
        })
      });

      const data = await response.json();
      
      if (data && data.story) {
        if (storyBody) storyBody.innerText = data.story;

        // Deduct 1 credit upon successful generation if not on unlimited plan
        if (!isUnlimited) {
          credits = Math.max(0, credits - 1);
          setSafeStorage('lumujo_credits', credits.toString());
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
        storyBody.innerText = "Could not reach the serverless backend. Check your Netlify deployment log or CORS settings.";
      }
      if (result) result.classList.remove("hidden");
    } finally {
      if (loading) loading.classList.add("hidden");
    }
  }

  if (form) form.addEventListener('submit', generateStory);
});
