const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { character, companion, level, moral } = JSON.parse(event.body);

    // PASTE YOUR ACTUAL HUGGING FACE TOKEN INSIDE THE QUOTES BELOW:
    const SECRET_KEY = "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"; 

    const postData = JSON.stringify({
      inputs: `<|system|>\nYou are a professional children's book author. Write a short bedtime story.\n<|user|>\nWrite a short bedtime story about ${character} and their companion ${companion}. Reading Level: ${level}. Lesson: ${moral}.\n<|assistant|>\n`,
      parameters: { max_new_tokens: 400, temperature: 0.7 }
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api-inference.huggingface.co',
        path: '/models/HuggingFaceH4/zephyr-7b-beta',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SECRET_KEY.trim()}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.error) {
              resolve({ statusCode: 200, body: JSON.stringify({ error: `AI Error: ${result.error}` }) });
              return;
            }
            const generatedText = result[0]?.generated_text || result.generated_text || "";
            const cleanStory = generatedText.split("<|assistant|>").pop().trim();
            resolve({
              statusCode: 200,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ story: cleanStory || "Once upon a time..." })
            });
          } catch (e) {
            resolve({ statusCode: 200, body: JSON.stringify({ error: `Parsing break: ${e.message}` }) });
          }
        });
      });

      req.on('error', (e) => {
        resolve({ statusCode: 200, body: JSON.stringify({ error: `Connection failed: ${e.message}` }) });
      });

      req.write(postData);
      req.end();
    });

  } catch (error) {
    return { statusCode: 200, body: JSON.stringify({ error: `Function issue: ${error.message}` }) };
  }
};
