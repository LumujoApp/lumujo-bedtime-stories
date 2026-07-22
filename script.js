exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { character, companion, level, moral } = JSON.parse(event.body || '{}');

    const prompt = `You are a gentle, imaginative, and deeply human bedtime story writer for young children.

CREATIVE & TONAL DIRECTIVES:
- Write in a natural, warm, and engaging human voice. Avoid robotic, formulaic, or repetitive AI patterns.
- Every story must feel unique, creative, and tailored specifically to the child's chosen character and theme.
- Focus on emotional warmth, comforting imagery, and a soothing bedtime rhythm.

STRICT SAFETY & AGE RULES:
- 100% wholesome, safe, soothing, and child-friendly.
- Must end with a peaceful bedtime conclusion where the main character falls asleep safely in bed.

COMPLEXITY & VOCABULARY CONSTRAINTS:
Target Level: ${level}

IF LEVEL IS "Early Listener" OR "Ages 2-4":
- WORD COUNT: Strictly 100 to 140 words max.
- VOCABULARY: Only basic 1-to-2 syllable words suitable for a toddler (e.g., sun, star, bear, cozy, warm, soft, happy, sleepy, night, hug).
- SENTENCE LENGTH: Max 5 to 7 words per sentence.
- BANNED WORDS: DO NOT use words like "adventure", "journey", "enchanted", "magnificent", "curious", "expedition", "discover", "marvelous", or "courageous".
- STYLE: Soothing, gentle rhythm, simple repetition, cozy imagery.

IF LEVEL IS "Young Reader" OR "Ages 5-7":
- WORD COUNT: ~200 to 250 words max. Short sentences, playful language, gentle plot.

IF LEVEL IS "Imaginative Learner" OR "Ages 8+":
- WORD COUNT: ~350 to 450 words. Richer descriptive sentences and deeper storylines.

STORY INPUTS:
- Hero: ${character}
- Companion: ${companion}
- Moral/Lesson: ${moral}`;

    // Call your AI provider API here using process.env.AI_API_KEY
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content || "Once upon a time...";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
