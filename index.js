const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/extract', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('Missing url');

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const bodyText = await page.evaluate(() => document.body.innerText);
        const idMatch = bodyText.match(/\b\d{27}\b/);
        const codeMatch = url.match(/\/pay\/[^\/]+\/(\d+)/);

        await browser.close();

        if (idMatch && codeMatch) {
            const finalUrl = `https://payment.irica.ir/#/pay/${idMatch[0]}/${codeMatch[1]}`;
            res.send(finalUrl);
        } else {
            res.status(404).send('شناسه یا کد پیدا نشد');
        }
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});