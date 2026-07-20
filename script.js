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

    /**
     * Helper function to scan inputs for inappropriate concepts
     */
    function containsInappropriateContent(text) {
        if (!text) return false;
        const cleanedText = text.toLowerCase().trim();
        return blockedKeywords.some(badWord => cleanedText.includes(badWord));
    }

    // --- Developer Testing Simulators ---
    window.simulatePurchase = function(tier) {
        if (tier === 'monthly') {
            maxStoriesAllowed = Infinity; 
            alert("✨ Simulation: Monthly Pass Activated! Unlimited access granted.");
        } else if (tier === 'onetime') {
            maxStoriesAllowed = 5; 
            alert("✨ Simulation: One-Time Pass Activated! 5 stories granted.");
        }
        
        if (paymentGate) paymentGate.classList.add('hidden');
        if (form) form.classList.remove('locked-opacity');
        if (submitBtn) {
            submitBtn.disabled = false;
            updateButtonLabel();
        }
    };

    // --- Helper function to keep button text synchronized ---
    function updateButtonLabel() {
        if (!submitBtn) return;
        if (maxStoriesAllowed === Infinity) {
            submitBtn.innerText = "Generate Magic Story (✨ Premium Unlimited)";
        } else {
            const remaining = maxStoriesAllowed - storyCount;
            submitBtn.innerText = `Generate Magic Story (${remaining} Remaining)`;
        }
    }

    // --- Form Management Reset Procedures ---
    window.resetForm = function() {
        if (form) {
            form.reset();
            
            if (storyCount >= maxStoriesAllowed) {
                if (paymentGate) paymentGate.classList.remove('hidden');
                form.classList.add('locked-opacity');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = "Story Limit Reached 🔒 Buy Pass Above";
                }
                return;
            }

            form.classList.remove('hidden');
            if (submitBtn) submitBtn.disabled = false;
            
            ['customToyBox', 'customAgeBox', 'customLessonBox'].forEach(boxId => {
                const box = document.getElementById(boxId);
                if (box) box.classList.add('hidden');
            });
        }
        if (result) result.classList.add('hidden');
        if (loading) loading.classList.add('hidden');
        updateButtonLabel();
    };

    // --- Form Generation Handler Loop ---
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (storyCount >= maxStoriesAllowed) {
                if (paymentGate) paymentGate.classList.remove('hidden');
                form.classList.add('locked-opacity');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = "Access Locked 🔒 Buy Pass Above";
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // Extract exact input values cleanly
            const heroNameInput = document.getElementById('childName');
            const heroName = heroNameInput ? heroNameInput.value.trim() : "";
            
            const companionSelect = document.getElementById('favoriteToy');
            const companionName = companionSelect && companionSelect.value === 'other' 
                ? (document.getElementById('customToy') ? document.getElementById('customToy').value.trim() : "")
                : (companionSelect ? companionSelect.value : "");

            const complexitySelect = document.getElementById('ageRange');
            const complexityLevel = complexitySelect && complexitySelect.value === 'other'
                ? (document.getElementById('customAge') ? document.getElementById('customAge').value.trim() : "")
                : (complexitySelect ? complexitySelect.value : "");

            const lessonSelect = document.getElementById('lessonTopic');
            const lessonTopic = lessonSelect && lessonSelect.value === 'other'
                ? (document.getElementById('customLesson') ? document.getElementById('customLesson').value.trim() : "")
                : (lessonSelect ? lessonSelect.value : "");

            // Safety Interception Check
            if (
                containsInappropriateContent(heroName) || 
                containsInappropriateContent(companionName) || 
                containsInappropriateContent(complexityLevel) || 
                containsInappropriateContent(lessonTopic)
            ) {
                alert("🌙 Let's keep bedtime sweet and cozy! Please use gentle character names and themes suited for a calm night's rest.");
                return; 
            }

            // Normalization defaults using non-child vocabulary
            const safeHero = heroName || "the little adventurer";
            const safeCompanion = companionName || "their favorite companion";
            const safeComplexity = complexityLevel || "all readers";
            const safeLesson = lessonTopic || "being kind";

            // UI Transitions
            form.classList.add('hidden');
            if (loading) loading.classList.remove('hidden');
            if (result) result.classList.add('hidden');

            await new Promise(resolve => setTimeout(resolve, 2500));

            const titles = [
                `The Magical Journey of ${safeHero} and ${safeCompanion}`,
                `${safeHero}'s Nighttime Adventure with ${safeCompanion}`,
                `How ${safeCompanion} Helped ${safeHero} Save the Whispering Woods`
            ];

            const stories = [
                `Deep in the heart of the Dreamland Forest, ${safeHero} cuddled close with ${safeCompanion}. The room was quiet, save for the soft glow of the moon. Suddenly, ${safeCompanion} gave a tiny, magical twitch! "Come along," whispered ${safeCompanion}, "the stars have called us for a secret mission." Together, they flew up past the windowpane into a kingdom made entirely of soft clouds—a perfect destination for someone tracking at the ${safeComplexity} level. Through their magical flight, ${safeHero} realized that learning about ${safeLesson} wasn't scary at all—it was the grandest adventure of them all. And as they drifted back down to bed, ${safeHero} closed their eyes, feeling safer and braver than ever before.`,
                
                `The stars were blinking softly when ${safeHero} noticed something incredible. ${safeCompanion} was shining with a warm, golden light! "Tonight," ${safeCompanion} said with a smile, "we are going to visit the Valley of Whispers." In the valley, the gentle creatures were facing a puzzle perfect for an imaginative ${safeComplexity} mind. By working hand-in-hand, ${safeHero} and ${safeCompanion} showed everyone the true meaning of ${safeLesson}. The grateful creatures sang a sweet, humming lullaby that filled the night air. Resting their head on the pillow, ${safeHero} smiled, knowing that ${safeLesson} brings peace to the whole world.`,
                
                `Once upon a twilight sky, ${safeHero} sat on the edge of the bed, holding ${safeCompanion} tightly. With a soft *pop*, a tiny door opened right beneath the nightstand! ${safeCompanion} bravely took the lead, guiding ${safeHero} into a beautiful garden where flowers glowed in rhythm with their breathing. To keep the beautiful garden blooming for characters across the ${safeComplexity} kingdom, they had to practice a very important lesson: ${safeLesson}. With a brave heart, ${safeHero} did exactly that, and the entire garden burst into a spectacular rainbow of starlight. Tired but deeply happy, ${safeHero} climbed back into bed, snuggled up with ${safeCompanion}, and drifted into the sweetest dreams.`
            ];

            const randomIndex = Math.floor(Math.random() * stories.length);

            const titleEl = document.getElementById('storyTitle');
            const bodyEl = document.getElementById('storyBody');
            if (titleEl) titleEl.innerText = titles[randomIndex];
            if (bodyEl) bodyEl.innerText = stories[randomIndex];

            storyCount++;

            if (loading) loading.classList.add('hidden');
            if (result) result.classList.remove('hidden');
            
            if (storyCount >= maxStoriesAllowed) {
                if (paymentGate) paymentGate.classList.remove('hidden');
                if (form) form.classList.add('locked-opacity');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = "Story Limit Reached 🔒 Buy Pass Above";
                }
            } else {
                updateButtonLabel();
            }
        });
    }

    // --- Dynamic Dropdown Field Handlers ---
    window.toggleCustomInput = function(selectEl, customBoxId) {
        const customBox = document.getElementById(customBoxId);
        if (!customBox) return;
        
        const inputEl = customBox.querySelector('input');
        
        if (selectEl.value === 'other') {
            customBox.classList.remove('hidden');
            if (inputEl) inputEl.required = true;
        } else {
            customBox.classList.add('hidden');
            if (inputEl) {
                inputEl.required = false;
                inputEl.value = '';
            }
        }
    };
});