const fs = require('fs');
const path = require('path');

async function simulateRegistration() {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let body = '';

    const fields = {
        type: 'UTS',
        packageType: 'flux_session',
        name: 'Test Setup User',
        email: 'test.setup123@example.com',
        password: 'password123',
        nim: '12345',
        subject: 'fisika-dasar-2',
        whatsapp: '081234567890',
    };

    for (const [key, value] of Object.entries(fields)) {
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
        body += `${value}\r\n`;
    }

    // Add dummy file
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="paymentProof"; filename="dummy.png"\r\n`;
    body += `Content-Type: image/png\r\n\r\n`;
    body += `dummy file content\r\n`;
    body += `--${boundary}--\r\n`;

    try {
        const res = await fetch('https://belajarbarengnata.vercel.app/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
            },
            body: body,
        });

        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch (err) {
        console.error(err);
    }
}

simulateRegistration();
