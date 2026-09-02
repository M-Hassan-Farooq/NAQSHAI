async function check() {
    try {
        const res = await fetch('http://localhost:3000/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'What plots are available in Islamabad?' }],
                language: 'EN'
            })
        });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text.slice(0, 500));
    } catch (e) {
        console.error(e);
    }
}
check();
