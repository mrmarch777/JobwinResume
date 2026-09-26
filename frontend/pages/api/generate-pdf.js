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
    
    // CRITICAL: Emulate print media so @media print CSS rules apply correctly
    await page.emulateMediaType('print');
    
    // Set full HTML content — wait for all resources to settle
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF — Research finding: @page CSS margin and Puppeteer margin STACK (double margin bug).
    // Fix: Set Puppeteer margin to 0, let CSS @page { margin: 20mm 18mm } be the ONLY source of margins.
    // Use preferCSSPageSize:true so CSS @page size rules take full precedence.
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
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
