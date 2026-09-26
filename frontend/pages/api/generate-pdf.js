import chromium from '@sparticuz/chromium';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
    responseLimit: false,
  },
  maxDuration: 30,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html, filename = 'Resume.pdf' } = req.body;
  if (!html) {
    return res.status(400).json({ error: 'Missing html body' });
  }

  let browser = null;
  try {
    // Use puppeteer-core with @sparticuz/chromium for serverless
    const puppeteer = (await import('puppeteer-core')).default;
    
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Must emulate print BEFORE setContent so @media print CSS rules apply
    await page.emulateMediaType('print');
    
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Use Puppeteer margin as the ONLY margin source.
    // Do NOT also set @page margin in CSS — they stack and double the margin.
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '18mm', right: '15mm', bottom: '18mm', left: '15mm' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
}
