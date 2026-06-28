import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Globe2,
  Mail,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { fragrances, giftSets, ingredients, testimonials } from './data';
import type { Fragrance } from './types';

type CartLine = {
  fragrance: Fragrance;
  quantity: number;
};

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Collection', href: '#collection' },
  { label: 'Ingredients', href: '#ingredients' },
  { label: 'Our Story', href: '#story' },
  { label: 'Gift Sets', href: '#gift-sets' },
  { label: 'Contact', href: '#contact' },
];

const money = (value: number) => `AED ${value}`;

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState('');

  const hero = fragrances[0];
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const cartTotal = cart.reduce((total, line) => total + line.fragrance.price * line.quantity, 0);

  const searchResults = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return fragrances.filter((fragrance) => {
      return (
        fragrance.name.toLowerCase().includes(value) ||
        fragrance.arabicName.includes(value) ||
        fragrance.notes.some((note) => note.toLowerCase().includes(value))
      );
    });
  }, [query]);

  function addToCart(fragrance: Fragrance) {
    setCart((current) => {
      const existing = current.find((line) => line.fragrance.id === fragrance.id);
      if (!existing) return [...current, { fragrance, quantity: 1 }];
      return current.map((line) =>
        line.fragrance.id === fragrance.id
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      );
    });
    setCartOpen(true);
  }

  function updateQuantity(id: string, quantity: number) {
    setCart((current) =>
      current
        .map((line) => (line.fragrance.id === id ? { ...line, quantity } : line))
        .filter((line) => line.quantity > 0),
    );
  }

  function scrollToCollection() {
    document.querySelector('#collection')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Al Faisal Perfumes home">
          <span>AL FAISAL</span>
          <small>PERFUMES</small>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a className="icon-button desktop-search" href="#collection" aria-label="Search collection">
            <Search size={20} strokeWidth={1.8} />
          </a>
          <button className="language-button" type="button" aria-label="Switch language">
            <Globe2 size={17} strokeWidth={1.8} />
            <span>AR</span>
          </button>
          <button className="icon-button cart-button" type="button" onClick={() => setCartOpen(true)} aria-label="Open shopping bag">
            <ShoppingBag size={20} strokeWidth={1.8} />
            {cartCount > 0 && <b>{cartCount}</b>}
          </button>
          <button
            className="icon-button menu-button"
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
      )}

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">THE ART OF ARABIAN PERFUMERY</p>
          <h1>Essence Crafted for Presence.</h1>
          <p className="hero-description">
            Discover a collection of refined fragrances inspired by the most treasured ingredients of the East.
          </p>
          <div className="hero-actions">
            <button className="button button--gold" type="button" onClick={scrollToCollection}>
              Explore the Collection <ArrowRight size={17} />
            </button>
            <a className="button button--outline" href="#story">
              Discover Our Story
            </a>
          </div>
        </div>

        <div className="hero-media" aria-label="Oud Noir fragrance visual">
          <img
            className="hero-media__image"
            src={hero.image}
            alt="Oud Noir perfume on a floating island"
            decoding="async"
          />
          <video
            className="hero-media__video"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={hero.image}
            aria-label="Oud Noir perfume commercial"
          >
            <source src="/src/assets/images/al-faisal-hero-light.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      <section className="collection section" id="collection">
        <div className="section-heading">
          <p className="eyebrow">THE SIGNATURE COLLECTION</p>
          <h2>Seven expressions of depth, elegance, and timeless scent.</h2>
          <div className="heading-rule" />
        </div>

        <label className="collection-search" htmlFor="collection-search">
          <Search size={18} />
          <input
            id="collection-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by fragrance or ingredient"
          />
        </label>

        {query && (
          <p className="search-count">
            {searchResults.length ? `${searchResults.length} fragrance${searchResults.length > 1 ? 's' : ''} found` : 'No fragrances found'}
          </p>
        )}

        <div className="product-list">
          {(query ? searchResults : fragrances).map((fragrance, index) => (
            <article className={`product-row ${index % 2 ? 'product-row--reverse' : ''}`} key={fragrance.id}>
              <div className="product-visual">
                <img
                  src={fragrance.image}
                  alt={`${fragrance.name} perfume`}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="product-card">
                <div className="product-card__topline">
                  <p>{fragrance.type}</p>
                  <span><Star size={13} fill="currentColor" /> {fragrance.rating}</span>
                </div>
                <h3>{fragrance.name}</h3>
                <p className="product-card__arabic">{fragrance.arabicName}</p>
                <p className="product-card__description">{fragrance.description}</p>
                <div className="note-list">
                  {fragrance.notes.map((note) => <span key={note}>{note}</span>)}
                </div>
                <div className="product-card__footer">
                  <strong>{money(fragrance.price)}</strong>
                  <button type="button" onClick={() => addToCart(fragrance)}>
                    Add to Bag <ShoppingBag size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ingredients section section--muted" id="ingredients">
        <div className="section-heading">
          <p className="eyebrow">FROM NATURE TO MEMORY</p>
          <h2>Ingredients with a lasting presence.</h2>
          <div className="heading-rule" />
        </div>
        <div className="ingredient-grid">
          {ingredients.map((ingredient) => (
            <article className="ingredient-card" key={ingredient.id}>
              <span className="ingredient-card__dot" />
              <h3>{ingredient.name}</h3>
              <p>{ingredient.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="story section" id="story">
        <div className="story-copy">
          <p className="eyebrow">CRAFTED IN THE UAE</p>
          <h2>Modern perfumery, rooted in Arabian ritual.</h2>
          <p>
            Al Faisal Perfumes brings together the richness of Arabian fragrance traditions and contemporary refinement. Every composition is designed to leave a lasting impression—layered, elegant, and made for moments that matter.
          </p>
          <a className="text-link" href="#contact">Meet the Maison <ChevronRight size={17} /></a>
        </div>
        <div className="story-panel">
          <span>THE HOUSE OF</span>
          <strong>AL FAISAL</strong>
          <p>Refined in the UAE. Composed for lasting presence.</p>
        </div>
      </section>

      <section className="gift-section section section--muted" id="gift-sets">
        <div className="section-heading">
          <p className="eyebrow">THE ART OF GIFTING</p>
          <h2>Thoughtfully composed for every occasion.</h2>
          <div className="heading-rule" />
        </div>
        <div className="gift-grid">
          {giftSets.map((gift) => (
            <article className="gift-card" key={gift.id}>
              <img src={gift.image} alt={gift.name} loading="lazy" decoding="async" />
              <div>
                <p className="gift-card__price">{money(gift.price)}</p>
                <h3>{gift.name}</h3>
                <p>{gift.description}</p>
                <button type="button" onClick={() => scrollToCollection()}>Explore Set <ArrowRight size={15} /></button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonials section">
        <div className="section-heading">
          <p className="eyebrow">WORN. REMEMBERED.</p>
          <h2>Notes from the Al Faisal house.</h2>
          <div className="heading-rule" />
        </div>
        <div className="testimonial-grid">
          {testimonials.slice(0, 3).map((testimonial) => (
            <blockquote className="testimonial-card" key={testimonial.id}>
              <div className="stars" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}
              </div>
              <p>“{testimonial.quote}”</p>
              <footer>{testimonial.author} · {testimonial.location}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="newsletter section section--muted" id="contact">
        <div>
          <p className="eyebrow">ENTER THE HOUSE OF AL FAISAL</p>
          <h2>Receive new creations and private offers.</h2>
        </div>
        <form onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="email">Email address</label>
          <input id="email" type="email" placeholder="Your email address" autoComplete="email" />
          <button className="button button--gold" type="submit"><Mail size={17} /> Join the Maison</button>
        </form>
      </section>

      <footer className="site-footer">
        <div className="brand">
          <span>AL FAISAL</span>
          <small>PERFUMES</small>
        </div>
        <p>© 2026 Al Faisal Perfumes. Crafted in the UAE.</p>
        <a href="#home">Back to top ↑</a>
      </footer>

      <a className="floating-contact" href="#contact" aria-label="Contact Al Faisal Perfumes">
        <Mail size={20} />
      </a>

      {cartOpen && (
        <div className="cart-layer" role="dialog" aria-modal="true" aria-label="Shopping bag">
          <button className="cart-layer__backdrop" type="button" onClick={() => setCartOpen(false)} aria-label="Close shopping bag" />
          <aside className="cart-drawer">
            <div className="cart-drawer__header">
              <div>
                <p className="eyebrow">YOUR SELECTION</p>
                <h2>Shopping Bag</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setCartOpen(false)} aria-label="Close shopping bag"><X size={22} /></button>
            </div>

            <div className="cart-items">
              {!cart.length && <p className="cart-empty">Your bag is waiting for a signature scent.</p>}
              {cart.map((line) => (
                <article className="cart-line" key={line.fragrance.id}>
                  <img src={line.fragrance.image} alt="" loading="lazy" />
                  <div>
                    <h3>{line.fragrance.name}</h3>
                    <p>{money(line.fragrance.price)}</p>
                    <div className="quantity-control">
                      <button type="button" onClick={() => updateQuantity(line.fragrance.id, line.quantity - 1)} aria-label="Reduce quantity"><Minus size={14} /></button>
                      <span>{line.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(line.fragrance.id, line.quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                      <button className="remove-line" type="button" onClick={() => updateQuantity(line.fragrance.id, 0)} aria-label="Remove item"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-summary">
              <p><span>Subtotal</span><strong>{money(cartTotal)}</strong></p>
              <button className="button button--gold" type="button" disabled={!cart.length}>Proceed to Checkout <ArrowRight size={16} /></button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
