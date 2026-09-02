import { POST } from '../app/api/chat/route.js';

async function test() {
    try {
        const req = {
            json: async () => ({
                messages: [{ role: 'user', content: 'What plots are available in Islamabad?' }],
                language: 'EN'
            })
        };
        const res = await POST(req);
        const data = await res.json();
        console.log('Result data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Direct route error:', err);
    }
}
test();
