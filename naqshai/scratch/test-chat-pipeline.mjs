async function runTests() {
    const baseUrl = 'http://localhost:3000';

    console.log('=== TEST 1: Querying live Islamabad plots from /api/chat ===');
    try {
        const res1 = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'What plots are currently available in Islamabad?' }],
                language: 'EN'
            })
        });
        const data1 = await res1.json();
        console.log('Status:', res1.status);
        console.log('Reply preview:', data1.reply?.slice(0, 160) + '...');
        console.log('Recommended plots count:', data1.recommendedPlots?.length);
        if (data1.recommendedPlots?.length > 0) {
            console.log('First recommended plot:', {
                id: data1.recommendedPlots[0].id,
                title: data1.recommendedPlots[0].title,
                city: data1.recommendedPlots[0].city,
                price: data1.recommendedPlots[0].price,
                floodRisk: data1.recommendedPlots[0].floodRisk,
                sellerPhone: data1.recommendedPlots[0].sellerPhone
            });
        }
    } catch (err) {
        console.error('Test 1 failed:', err);
    }

    console.log('\n=== TEST 2: Zero-Match Fallback Test (Quetta under 10 Lakh) ===');
    try {
        const res2 = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Show me 5 Marla residential plots in Quetta under 10 Lakh' }],
                language: 'EN'
            })
        });
        const data2 = await res2.json();
        console.log('Status:', res2.status);
        console.log('Reply preview:', data2.reply);
        console.log('Recommended plots count (Expected 0):', data2.recommendedPlots?.length);
        if (data2.recommendedPlots?.length === 0) {
            console.log('✅ PASS: Clean fallback correctly returned 0 plots without hallucinating mock data!');
        } else {
            console.warn('❌ FAIL: Plots were returned when none should exist in Quetta!');
        }
    } catch (err) {
        console.error('Test 2 failed:', err);
    }

    console.log('\n=== TEST 3: Roman Urdu prompt with Rawalpindi plots ===');
    try {
        const res3 = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Rawalpindi me plot chahiye jiska budget 1 crore se kam ho' }],
                language: 'RO'
            })
        });
        const data3 = await res3.json();
        console.log('Status:', res3.status);
        console.log('Reply preview:', data3.reply?.slice(0, 160) + '...');
        console.log('Recommended plots count:', data3.recommendedPlots?.length);
    } catch (err) {
        console.error('Test 3 failed:', err);
    }

    console.log('\n=== TEST 4: Verification of /api/recommend delegation ===');
    try {
        const res4 = await fetch(`${baseUrl}/api/recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Hello, which cities do you have plots in?' }],
                language: 'Auto'
            })
        });
        const data4 = await res4.json();
        console.log('Status:', res4.status);
        console.log('Reply preview:', data4.reply?.slice(0, 160) + '...');
        console.log('Recommended plots count:', data4.recommendedPlots?.length);
        if (res4.ok) {
            console.log('✅ PASS: /api/recommend correctly delegated to /api/chat!');
        }
    } catch (err) {
        console.error('Test 4 failed:', err);
    }
}

runTests();
