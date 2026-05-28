import React from 'react'
import "./Footer.css"

function Footer() {
  return (
     <footer className="footer">

        <div className="footer-top">

          {/* LEFT */}
          <div className="footer-brand">

            <h2 className="footer-logo">
              Ucare<span></span>
            </h2>

            <p>
              Providing trusted healthcare services with
              compassion, innovation, and excellence.
            </p>

          </div>

          {/* DISCOVER */}
          <div className="footer-links">

            <h3>Discover</h3>

            <a href="#Home">Home</a>
            <a href="#About">About Us</a>
            <a href="#Services">Services</a>
            <a href="#Doctors">Doctors</a>
            {/* <a href="#Departments">Departments</a> */}
            <a href="#Contact">Contact</a>

          </div>

          {/* INFO */}
          <div className="footer-links">

            <h3>Info</h3>

            <a href="/">Emergency Care</a>
            <a href="/">Medical Support</a>
            <a href="/">Appointments</a>

            <h3 className="footer-question">
              Questions?
            </h3>

            <a href="/">FAQ</a>
            <a href="/">Support</a>

          </div>

          {/* NEWSLETTER */}
          <div id="footer">
            <div className="footer-newsletter">

              <h3>
                Contact Details
              </h3>

              <p>
                Perinthalmanna, Kerala, India <br />
                Phone: +91  95652-78906 <br />
                Email: ucare@gmail.com
              </p>

              <div className="newsletter-box">

                <input
                  type="email"
                  placeholder="Enter Your Email"
                />

                <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
                  <button>
                    →
                  </button>
                </a>

              </div>

            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">

          <p>
            © 2026 Ucare Hospital. All rights reserved.
          </p>

          <div className="footer-socials">

            <a href="/">X</a>
            <a href="/">in</a>
            <a href="/">f</a>
            <a href="/">ig</a>

          </div>

        </div>

      </footer>
  )
}

export default Footer
