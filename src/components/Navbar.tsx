import Link from 'next/link';
import '../styles/globals.css'; // Global styles should work for Navbar

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/editor">Editor</Link>
        </li>
        <li>
          <Link href="/templates">Templates</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
