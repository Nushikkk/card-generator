'use client'

import Link from 'next/link';

const Home = () => {

  return (
    <div>
      <h2>Welcome to the Business Card Generator!</h2>
      <p>Select a template or create a custom design for your card.</p>
      <Link href="/editor">Start Creating</Link>
      <br />
      <Link href="/templates">Browse Templates</Link>
    </div>
  );
};

export default Home;
