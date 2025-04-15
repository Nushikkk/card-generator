"use client";

import React from "react";

const ContactPage = () => {
  return (
    <div className="container-fluid bg-photo-editor vh-100 d-flex justify-content-center align-items-center">
      <div className="col-md-6 col-lg-5 bg-white rounded-4 shadow-lg p-5 animate__animated animate__fadeIn">
        <h2 className="text-center mb-4 text-primary fw-bold">Get in Touch</h2>

        <form>
          {/* Name */}
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control rounded-3"
              id="name"
              placeholder="John Doe"
            />
            <label htmlFor="name">Full Name</label>
          </div>

          {/* Email */}
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control rounded-3"
              id="email"
              placeholder="name@example.com"
            />
            <label htmlFor="email">Email address</label>
          </div>

          {/* Message */}
          <div className="form-floating mb-4">
            <textarea
              className="form-control rounded-3"
              placeholder="Leave your message here"
              id="message"
              style={{ height: "150px" }}
            ></textarea>
            <label htmlFor="message">Your Message</label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold rounded-3">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
