import fs from 'fs';

async function check() {
    try {
        const res = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'What plots are available in Islamabad?' }],
                language: 'EN'
            })
        });
        const text = await res.text();
        fs.writeFileSync('scratch/error-full.html', text);
        console.log('Saved error html of length:', text.length);
    } catch (e) {
        console.error(e);
    }
}
check();
