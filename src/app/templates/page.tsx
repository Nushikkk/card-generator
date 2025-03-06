'use client'

import Link from 'next/link';

const TemplatesPage = () => {
  return (
    <div>
      <h2>Choose a Template</h2>
      <p>Select a pre-made template for your business card.</p>
      <div>
        <Link href="/editor?template=template1">Template 1</Link>
        <br />
        <Link href="/editor?template=template2">Template 2</Link>
      </div>
    </div>
  );
};

export default TemplatesPage;
