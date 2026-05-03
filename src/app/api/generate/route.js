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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryAfterSeconds = (error) => {
    const retryDelay = error?.errorDetails?.find(
        (detail) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
    )?.retryDelay;

    return retryDelay ? parseInt(retryDelay, 10) : null;
};

export async function POST(req) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let data = '';

        if (contentType.includes('application/json')) {
            const body = await req.json();
            data = body?.text || '';
        } else {
            data = await req.text();
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';

        if (!apiKey) {
            return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
        }

        if (!data.trim()) {
            return NextResponse.json({ error: 'Please enter text to generate flashcards.' }, { status: 400 });
        }

        // Initialize the GenerativeAI client with JSON response type
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
        });

        // Combine system prompt and user input
        const prompt = `${systemPrompt}\n\nUser Input:\n${data}`;

        // Retry once when Gemini asks us to back off briefly.
        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (error) {
            if (error?.status === 429) {
                const retryAfterSeconds = getRetryAfterSeconds(error);
                if (retryAfterSeconds) {
                    await sleep((retryAfterSeconds + 1) * 1000);
                    result = await model.generateContent(prompt);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }
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
        const status = error?.status || 500;

        if (status === 429) {
            const retryAfterSeconds = getRetryAfterSeconds(error);
            return NextResponse.json(
                {
                    error: retryAfterSeconds
                        ? `Gemini rate limit reached. Please wait about ${retryAfterSeconds} seconds and try again.`
                        : 'Gemini rate limit reached. Please wait a bit and try again.',
                    retryAfterSeconds,
                },
                { status: 429 }
            );
        }

        return NextResponse.json({ error: error.message || 'Failed to generate flashcards.' }, { status });
    }
}
