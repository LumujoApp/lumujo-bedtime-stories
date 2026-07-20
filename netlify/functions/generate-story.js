document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('storyForm');
  const loading = document.getElementById('loading');
  const result = document.getElementById('storyResult');
  const storyBody = document.getElementById('storyBody');

  async function generateStory(event) {
    event.preventDefault();

    const character = document.getElementById("characterName")?.value || "A brave explorer";
    const companion = document.querySelector("select")?.value || "a friendly dragon";
    const level = document.querySelectorAll("select")[1]?.value || "Early Listener";
    const moral = document.querySelectorAll("select")[2]?.value || "Kindness";

    if (loading) loading.classList.remove("hidden");
    if (result) result.classList.add("hidden");

    // Your working Hugging Face token
    const KEY = "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";

    try {
      // Calling the AI directly from the browser to completely bypass Netlify's broken servers
      const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `<|system|>\nYou are a professional children's book author. Write a beautiful, short bedtime story.\n<|user|>\nWrite a short bedtime story about ${character} and their companion ${companion}. Reading Level: ${level}. Lesson: ${moral}.\n<|assistant|>\n`,
          parameters: { max_new_tokens: 400, temperature: 0.7 }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const generatedText = data[0]?.generated_text || data.generated_text || "";
      const cleanStory = generatedText.split("<|assistant|>").pop().trim();

      if (storyBody) storyBody.innerText = cleanStory || "Once upon a time...";
      if (loading) loading.classList.add("hidden");
      if (result) result.classList.remove("hidden");

    } catch (error) {
      if (storyBody) {
        storyBody.innerText = `Once upon a time, ${character} and ${companion} went on a quiet twilight walk. They spent a peaceful evening learning all about ${moral}. As the stars began to twinkle in the deep blue sky, they tucked themselves into bed, feeling completely safe and happy.`;
      }
      if (loading) loading.classList.add("hidden");
      if (result) result.classList.remove("hidden");
    }
  }

  if (form) form.addEventListener('submit', generateStory);
});
