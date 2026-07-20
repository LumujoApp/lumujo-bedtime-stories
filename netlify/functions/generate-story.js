exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { character, companion, level, moral } = JSON.parse(event.body);

    // PASTE YOUR ACTUAL HUGGING FACE TOKEN INSIDE THE QUOTES BELOW:
    const SECRET_KEY = "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"; 

    const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SECRET_KEY.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `<|system|>\nYou are a professional children's book author. Write a short bedtime story.\n<|user|>\nWrite a short bedtime story about ${character} and their companion ${companion}. Reading Level: ${level}. Lesson: ${moral}.\n<|assistant|>\n`,
        parameters: { max_new_tokens: 400, temperature: 0.7 }
      })
    });

    const result = await response.json();
    
    if (result.error) {
      return { statusCode: 200, body: JSON.stringify({ error: `AI Error: ${result.error}` }) };
    }

    const generatedText = result[0]?.generated_text || result.generated_text || "";
    const cleanStory = generatedText.split("<|assistant|>").pop().trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story: cleanStory || "Once upon a time..." })
    };
  } catch (error) {
    return { statusCode: 200, body: JSON.stringify({ error: `Connection failed: ${error.message}` }) };
  }
};
