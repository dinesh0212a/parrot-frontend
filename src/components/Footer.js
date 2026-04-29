export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo">🦜 Parrot</div>
          <p className="footer-desc">Feast Your Senses, Fast and Fresh. Order Restaurant food, takeaway and groceries from the best restaurants in your area.</p>
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            {['fab fa-facebook-f', 'fab fa-twitter', 'fab fa-instagram', 'fab fa-linkedin-in'].map(ic => (
              <a key={ic} href="#" style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>
                <i className={ic}></i>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3>Important Links</h3>
          <ul>
            {['Get help', 'Add your restaurant', 'Sign up to deliver', 'Create a business account'].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Legal Pages</h3>
          <ul>
            {['Terms and conditions', 'Privacy', 'Cookies', 'Privacy Policy', 'Pricing'].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Get Exclusive Deals in your Inbox</h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>We won't spam, read our email policy</p>
          <div className="newsletter-form">
            <input placeholder="youremail@gmail.com" />
            <button>Subscribe</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Parrot 🦜 Copyright 2026, All Rights Reserved.</span>
        <span>Company # 900911-653, Registered with House of companies.</span>
      </div>
    </footer>
  );
}
