exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { character, companion, level, moral } = JSON.parse(event.body);
    const SECRET_KEY = "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"; 

    // Using a clean global fetch call with an alternate highly stable URL
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

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: 200, body: JSON.stringify({ error: `HuggingFace API turned away the request: ${errText}` }) };
    }

    const result = await response.json();
    const generatedText = result[0]?.generated_text || result.generated_text || "";
    const cleanStory = generatedText.split("<|assistant|>").pop().trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story: cleanStory || "Once upon a time..." })
    };
  } catch (error) {
    return { statusCode: 200, body: JSON.stringify({ error: `System connection delay: ${error.message}` }) };
  }
};
