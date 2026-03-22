export default function Navbar() {
  return (
    <header className="navbar">
      <div className="logoWrap">
        <div className="logoPlaceholder">Logo</div>
        <div className="logoText">
          <span className="logoTitle">MY WORLD</span>
          <span className="logoSub">FOOTPRINT</span>
        </div>
      </div>

      <nav className="navLinks">
        <a href="#">About Us</a>
        <a href="#">Github</a>
        <a href="#">Log In</a>
      </nav>
    </header>
  );
}