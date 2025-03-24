import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
      <div className="container">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav gap-4">
            <li className="nav-item">
              <Link className="nav-link text-uppercase fw-bold custom-nav-link" href="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-uppercase fw-bold custom-nav-link" href="/editor">Create your card</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-uppercase fw-bold custom-nav-link" href="/templates">Templates</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-uppercase fw-bold custom-nav-link" href="/templates">Contact Us</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
