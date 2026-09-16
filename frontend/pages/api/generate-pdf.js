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
    
    // Set full HTML content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF with proper A4 settings and document margins
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      // 15mm top/bottom, 18mm left/right — matches the @page margin in the print CSS
      // This gives the resume a proper document look (like Word) with white borders
      margin: { top: '15mm', right: '18mm', bottom: '15mm', left: '18mm' },
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
