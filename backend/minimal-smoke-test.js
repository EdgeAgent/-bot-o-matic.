const axios = require('axios');

const API_KEY = 'AIzaSyACgzKwM_fzQRXd-ct_Y6cWqHZZ4IvR5XA';
const MODEL = 'gemini-pro';

async function testGemini() {
    console.log('🚀 Testing Gemini API Connectivity...');

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

        const payload = {
            contents: [{
                role: 'user',
                parts: [{ text: "Hello! If you can read this, say 'Smoke test passed'." }]
            }]
        };

        console.log(`Sending request to ${url}...`);

        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('\n✅ Response Received:');
        console.log(JSON.stringify(response.data, null, 2));

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
            console.log('\n🎉 SUCCESS! Model said:', text);
        } else {
            console.log('\n⚠️  Response received but no text found.');
        }

    } catch (error) {
        console.error('\n❌ API Call Failed:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testGemini();
