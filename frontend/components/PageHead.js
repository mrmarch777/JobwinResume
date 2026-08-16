import Head from 'next/head';

export default function PageHead({ title, description }) {
  const fullTitle = title ? `${title} | JobWinResume` : 'JobWinResume — Build a Resume That Gets You Hired';
  const desc = description || 'AI-powered resume builder, job search, and career tools. Create ATS-optimized resumes, find jobs, and get hired faster.';
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://jobwinresume.com" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    </Head>
  );
}
