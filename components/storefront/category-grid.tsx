import React from 'react'
import Link from 'next/link'

const categories = [
  { name: 'Notebooks & Journals', count: '48 items', img: 'https://images.unsplash.com/photo-1776762249715-525ae7025e0a?w=700&h=900&fit=crop&auto=format', slug: 'notebooks-journals', gridArea: 'notebooks' },
  { name: 'Writing Instruments', count: '32 items', img: 'https://images.unsplash.com/photo-1518674660708-0e2c0473e68e?w=600&h=400&fit=crop&auto=format', slug: 'writing-instruments', gridArea: 'writing' },
  { name: 'Ink & Calligraphy', count: '19 items', img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop&auto=format', slug: 'ink-calligraphy', gridArea: 'ink' },
  { name: 'Paper & Cards', count: '56 items', img: 'https://images.unsplash.com/photo-1776762249708-31d7e1579748?w=700&h=900&fit=crop&auto=format', slug: 'paper-cards', gridArea: 'paper' },
  { name: 'Washi & Tapes', count: '24 items', img: 'https://images.unsplash.com/photo-1785668709724-52ddd2f2c086?w=600&h=400&fit=crop&auto=format', slug: 'washi-tapes', gridArea: 'washi' },
  { name: 'Gift Collections', count: '15 items', img: 'https://images.unsplash.com/photo-1694754920848-8855ee3ff364?w=900&h=400&fit=crop&auto=format', slug: 'gift-collections', gridArea: 'gift' },
  { name: 'Art Supplies', count: '27 items', img: 'https://images.unsplash.com/photo-1511285547760-79b561563b35?w=600&h=400&fit=crop&auto=format', slug: 'art-supplies', gridArea: 'art' },
  { name: 'Stamps & Seals', count: '11 items', img: 'https://images.unsplash.com/photo-1586380951230-e6703d9f6833?w=600&h=400&fit=crop&auto=format', slug: 'stamps-seals', gridArea: 'stamps' },
  { name: 'Desk Accessories', count: '38 items', img: 'https://images.unsplash.com/photo-1568819297129-80fd50360f8e?w=600&h=400&fit=crop&auto=format', slug: 'desk-accessories', gridArea: 'desk' },
  { name: 'Journaling Kits', count: '9 items', img: 'https://images.unsplash.com/photo-1764044371318-c7a7d546859c?w=900&h=400&fit=crop&auto=format', slug: 'journaling-kits', gridArea: 'journ' },
]

function CategoryCard({ category, style }: { category: typeof categories[0]; style?: React.CSSProperties }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative overflow-hidden cursor-pointer block"
      style={{
        gridArea: category.gridArea,
        borderRadius: '20px',
        backgroundImage: `url(${category.img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
      }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 transition-all duration-350"
        style={{
          background: 'linear-gradient(to top, rgba(13,31,21,0.88) 0%, rgba(13,31,21,0.35) 60%, rgba(13,31,21,0.05) 100%)',
          borderRadius: '20px',
        }}
      />
      {/* Hover gold border */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350"
        style={{ borderRadius: '20px', border: '1px solid rgba(201,169,110,0.6)' }}
      />
      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3
          className="mb-1"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '1.05rem',
            color: '#f5ede0',
            fontWeight: 500,
          }}
        >
          {category.name}
        </h3>
        <p
          className="text-xs group-hover:text-gold-500 transition-colors"
          style={{
            letterSpacing: '0.08em',
            color: '#a8c4b0',
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}
        >
          {category.count}&nbsp;&rarr;
        </p>
      </div>
    </Link>
  )
}

export function CategoryGrid() {
  return (
    <section className="py-20 px-5 md:px-8 bg-forest-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p
            className="text-[11px] uppercase tracking-[0.28em] mb-3"
            style={{ color: '#c9a96e' }}
          >
            Explore
          </p>
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(1.9rem, 4vw, 3rem)',
              color: '#f5ede0',
              fontWeight: 400,
              fontStyle: 'italic',
              lineHeight: 1.1,
            }}
          >
            Browse by Category
          </h2>
        </div>

        {/* Desktop asymmetric collage */}
        <div
          className="hidden md:grid gap-4"
          style={{
            gridTemplate: `
              "notebooks writing  paper" 200px
              "notebooks ink     paper" 175px
              "art       stamps  desk"  165px
              "gift      journ   washi" 155px
            / 1.35fr 1fr 1.2fr`,
          }}
        >
          {categories.map((cat) => (
            <CategoryCard key={cat.name} category={cat} />
          ))}
        </div>

        {/* Mobile 2-col grid */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.name}
              category={cat}
              style={{ gridArea: undefined, height: '180px' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
