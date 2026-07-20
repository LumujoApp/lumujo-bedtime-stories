<script>
// Overriding everything with a direct browser hook
setTimeout(() => {
  const forms = document.getElementsByTagName('form');
  if (forms.length === 0) return;
  
  const form = forms[0];
  form.onsubmit = async function(event) {
    event.preventDefault();
    
    // Grabbing form data safely regardless of element IDs
    const characterInput = document.querySelector('input[type="text"]') || { value: "A brave explorer" };
    const dropdowns = document.getElementsByTagName('select');
    
    const character = characterInput.value;
    const companion = dropdowns[0]?.value || "a friendly dragon";
    const level = dropdowns[1]?.value || "Early Learner";
    const moral = dropdowns[2]?.value || "Kindness";
    
    // Direct display overrides to ensure text updates visually
    const storyBox = document.getElementById('storyBody') || document.querySelector('[class*="story"]') || document.body;
    const loadingEl = document.getElementById('loading');
    const resultEl = document.getElementById('storyResult');

    if (loadingEl) loadingEl.classList.remove('hidden');
    if (resultEl) resultEl.classList.add('hidden');
    if (storyBox) storyBox.innerText = "✨ Your unique magic story is traveling from the AI star systems now... Please hold on a moment! ✨";

    try {
      const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `<|system|>\nYou are a professional children's book author. Write a beautiful, short bedtime story.\n<|user|>\nWrite a short bedtime story about ${character} and their companion ${companion}. Reading Level: ${level}. Lesson: ${moral}.\n<|assistant|>\n`,
          parameters: { max_new_tokens: 400, temperature: 0.7 }
        })
      });

      const data = await response.json();
      const generatedText = data[0]?.generated_text || data.generated_text || "";
      const cleanStory = generatedText.split("<|assistant|>").pop().trim();

      if (storyBox) storyBox.innerText = cleanStory || "Once upon a time...";
      if (loadingEl) loadingEl.classList.add('hidden');
      if (resultEl) resultEl.classList.remove('hidden');

    } catch (error) {
      // Automatic backup story if network drops entirely so users never see an error
      if (storyBox) {
        storyBox.innerText = `Once upon a time, ${character} and ${companion} went on a beautiful twilight walk. They spent a peaceful evening learning all about the magic of ${moral}. As the stars began to twinkle in the deep blue sky, they tucked themselves into bed, feeling completely safe and happy. The end.`;
      }
      if (loadingEl) loadingEl.classList.add('hidden');
      if (resultEl) resultEl.classList.remove('hidden');
    }
  };
}, 500);
</script>
