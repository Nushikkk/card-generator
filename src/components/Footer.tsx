import Link from "next/link";

const Footer = () => {
  return (
    <footer className="text-light py-3 mt-auto fixed-bottom" style={{backgroundColor: '#2c3e50AA'}}>
      <div className="container">
        <div className="row d-flex align-items-center">
          <div className="col-auto ms-0">
            <ul className="list-unstyled d-flex mb-0">
              <li className="me-4">
                Email: <a href="mailto:contact@bizcardmaker.com" className="text-light text-decoration-none">contact@bizcardmaker.com</a>
              </li>
              <li className="me-4">
                Phone: <a href="tel:+1234567890" className="text-light text-decoration-none">+1 (234) 567-890</a>
              </li>
              <li>
                Address: 123 Business St, City, Country
              </li>
            </ul>
          </div>

          {/* Copyright (further right) */}
          <div className="col-auto ms-auto">
            <div className="text-end small">
              &copy; {new Date().getFullYear()} BizCard Maker. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
