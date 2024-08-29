import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const systemPrompt = `
You are a flashcard creator. Your tasks:
- Generate multiple very concise, accurate flashcards.
- Provide a question/prompt on one side.
- Offer a clear answer/explanation on the other side.
- Tailor content to the user's learning goals.
- Include helpful hints or context when necessary.
- Only generate flashcards.

Return the following JSON format:
{
  "flashcards": [
    { "front": "str", "back": "str" },
    { "front": "str", "back": "str" },
    ...
  ]
}
`;

export async function POST(req) {
    try {
        const data = await req.text();

        // Initialize the GenerativeAI client with JSON response type
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // Combine system prompt and user input
        const prompt = `${systemPrompt}\n\nUser Input:\n${data}`;

        // Generate content using the model
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();  // Get the raw JSON text from the result

        console.log('Raw JSON response from API:', responseText); // For debugging purposes

        // Parse the JSON response safely
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
            return NextResponse.json({ error: 'Invalid JSON response from AI model' }, { status: 500 });
        }

        // Validate that the response contains the expected flashcards structure
        if (parsedResponse && Array.isArray(parsedResponse.flashcards)) {
            const flashcards = parsedResponse.flashcards;
            return NextResponse.json({ flashcards });
        } else {
            console.error('Flashcards not found or in incorrect format in the API response:', parsedResponse);
            return NextResponse.json({ error: 'No flashcards found or in incorrect format in the response' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error generating flashcards:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
