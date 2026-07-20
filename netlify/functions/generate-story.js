exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { character, companion, level, moral } = JSON.parse(event.body);

    // Fetch directly from an AI endpoint (e.g., Hugging Face, OpenAI, or a free provider)
    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3-8B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `<|system|>\nYou are a professional children's book author. Write a warm, human, natural, and deeply nuanced bedtime story. Avoid repetitive cliches or generic templates. Use rich sensory details, gentle pacing, and varied sentence lengths perfect for putting a child to sleep.\n<|user|>\nWrite a unique story about a character named ${character} and their companion ${companion}. The reading difficulty level should be suitable for ${level}, and the story must gently weave in a moral lesson about ${moral}.\n<|assistant|>\n`,
        parameters: { max_new_tokens: 800, temperature: 0.7 }
      })
    });

    const result = await response.json();
    // Extract text depending on the model's response format
    const generatedText = result[0]?.generated_text || result.generated_text || "Once upon a time...";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story: generatedText })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
