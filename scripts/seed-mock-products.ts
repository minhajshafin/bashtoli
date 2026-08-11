import { createClient } from '@supabase/supabase-js'

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) are missing.')
  }

  const supabase = createClient(url, key)

  console.log('Cleaning existing catalog and relational data...')

  // Delete dependencies first to respect Foreign Key constraints
  await supabase.from('cart_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('wishlist').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('order_status_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('product_images').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('product_option_values').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('product_options').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  console.log('Existing products and categories successfully removed.')

  console.log('Inserting mock categories...')
  const categoriesData = [
    { name: 'Bamboo Crafts & Utensils', slug: 'bamboo-crafts', sort_order: 1 },
    { name: 'Ceramic & Bamboo Mugs', slug: 'mugs-and-drinkware', sort_order: 2 },
    { name: 'Handwoven Hats & Wearables', slug: 'hats-and-wearables', sort_order: 3 },
    { name: 'Artisanal Home Decor', slug: 'home-and-decor', sort_order: 4 },
    { name: 'Eco-Friendly Baskets & Storage', slug: 'baskets-and-storage', sort_order: 5 },
    { name: 'Bamboo Stationery & Office', slug: 'stationery-and-office', sort_order: 6 },
  ]

  const { data: insertedCategories, error: catErr } = await supabase
    .from('categories')
    .insert(categoriesData)
    .select()

  if (catErr || !insertedCategories) {
    throw new Error(`Failed to insert categories: ${catErr?.message}`)
  }

  const categoryMap = new Map(insertedCategories.map((c) => [c.slug, c.id]))

  console.log('Inserting mock products and variants...')

  const productsToInsert = [
    {
      category_slug: 'bamboo-crafts',
      name: 'Handcrafted Bamboo Dinner Set',
      slug: 'handcrafted-bamboo-dinner-set',
      description: 'Sustainably harvested 4-piece organic bamboo dinnerware including plate, bowl, spoon, and chopsticks with a smooth natural lacquer finish.',
      base_price: 1250,
      active: true,
      featured: true,
      variants: [
        { sku: 'BAM-DIN-NAT', price: 1250, stock_qty: 35, option_values: { Finish: 'Natural Wood' } },
        { sku: 'BAM-DIN-DRK', price: 1400, stock_qty: 20, option_values: { Finish: 'Dark Polish' } }
      ]
    },
    {
      category_slug: 'bamboo-crafts',
      name: 'Organic Bamboo Cooking Spatula Set',
      slug: 'organic-bamboo-cooking-spatula-set',
      description: 'Set of 5 non-stick safe ergonomic bamboo kitchen utensils. Heat resistant, durable, and 100% biodegradable.',
      base_price: 450,
      active: true,
      featured: false,
      variants: [
        { sku: 'BAM-SPT-5PC', price: 450, stock_qty: 50, option_values: { Set: '5 Pieces' } }
      ]
    },
    {
      category_slug: 'bamboo-crafts',
      name: 'Handwoven Bamboo Tea Tray',
      slug: 'handwoven-bamboo-tea-tray',
      description: 'Artisanal woven tea serving tray with a reinforced rim. Perfect for traditional morning tea and guest hospitality.',
      base_price: 850,
      active: true,
      featured: true,
      variants: [
        { sku: 'BAM-TRY-MED', price: 850, stock_qty: 25, option_values: { Size: 'Medium (12 inch)' } },
        { sku: 'BAM-TRY-LRG', price: 1100, stock_qty: 18, option_values: { Size: 'Large (15 inch)' } }
      ]
    },
    {
      category_slug: 'bamboo-crafts',
      name: 'Polished Bamboo Cutlery Holder',
      slug: 'polished-bamboo-cutlery-holder',
      description: 'Multi-compartment dining table organizer made from seasoned bamboo stems with built-in ventilation and drainage slots.',
      base_price: 620,
      active: true,
      featured: false,
      variants: [
        { sku: 'BAM-CUT-01', price: 620, stock_qty: 30, option_values: { Type: 'Standard' } }
      ]
    },

    // Category 2: Ceramic & Bamboo Mugs
    {
      category_slug: 'mugs-and-drinkware',
      name: 'Bamboo Wrapped Ceramic Coffee Mug',
      slug: 'bamboo-wrapped-ceramic-coffee-mug',
      description: 'Double-walled ceramic mug insulated with a hand-carved natural bamboo sleeve. Keeps beverages warm while protecting hands.',
      base_price: 750,
      active: true,
      featured: true,
      variants: [
        { sku: 'MUG-BAM-350', price: 750, stock_qty: 40, option_values: { Capacity: '350 ml' } },
        { sku: 'MUG-BAM-500', price: 920, stock_qty: 30, option_values: { Capacity: '500 ml' } }
      ]
    },
    {
      category_slug: 'mugs-and-drinkware',
      name: 'Hand-Carved Solid Bamboo Tumbler',
      slug: 'hand-carved-solid-bamboo-tumbler',
      description: '100% natural hollowed bamboo stem tumbler with a food-grade stainless steel inner liner and removable tea infuser filter.',
      base_price: 1150,
      active: true,
      featured: true,
      variants: [
        { sku: 'TMB-BAM-INF', price: 1150, stock_qty: 25, option_values: { Style: 'With Stainless Steel Tea Strainer' } }
      ]
    },
    {
      category_slug: 'mugs-and-drinkware',
      name: 'Matte Black Clay & Bamboo Handle Mug',
      slug: 'matte-black-clay-bamboo-handle-mug',
      description: 'Artisan stoneware mug featuring a hand-bound bent bamboo handle. Modern minimalist aesthetics meet traditional craftsmanship.',
      base_price: 680,
      active: true,
      featured: false,
      variants: [
        { sku: 'MUG-BLK-BAM', price: 680, stock_qty: 22, option_values: { Color: 'Matte Black' } }
      ]
    },
    {
      category_slug: 'mugs-and-drinkware',
      name: 'Mini Bamboo Espresso Cup Set',
      slug: 'mini-bamboo-espresso-cup-set',
      description: 'Set of 2 handcrafted solid bamboo wood espresso shot cups. Lightweight, heat-insulating, and chemical-free.',
      base_price: 520,
      active: true,
      featured: false,
      variants: [
        { sku: 'CUP-ESP-2PC', price: 520, stock_qty: 35, option_values: { Pack: 'Pair (2 pcs)' } }
      ]
    },

    // Category 3: Handwoven Hats & Wearables
    {
      category_slug: 'hats-and-wearables',
      name: 'Classic Handwoven Straw Sun Hat',
      slug: 'classic-handwoven-straw-sun-hat',
      description: 'Wide-brimmed traditional sun hat woven from natural bamboo fiber and straw. Provides breathable UV protection for sunny days.',
      base_price: 580,
      active: true,
      featured: true,
      variants: [
        { sku: 'HAT-SUN-MED', price: 580, stock_qty: 25, option_values: { Size: 'Medium' } },
        { sku: 'HAT-SUN-LRG', price: 620, stock_qty: 20, option_values: { Size: 'Large' } }
      ]
    },
    {
      category_slug: 'hats-and-wearables',
      name: 'Artisanal Mathal Farmer Hat',
      slug: 'artisanal-mathal-farmer-hat',
      description: 'Iconic authentic Bangladeshi cone-shaped bamboo Mathal hat. Handcrafted by rural artisans with intricate bamboo strip weaving.',
      base_price: 450,
      active: true,
      featured: false,
      variants: [
        { sku: 'HAT-MTH-STD', price: 450, stock_qty: 15, option_values: { Style: 'Traditional' } }
      ]
    },
    {
      category_slug: 'hats-and-wearables',
      name: 'Natural Bamboo Fiber Tote Bag',
      slug: 'natural-bamboo-fiber-tote-bag',
      description: 'Eco-chic shoulder tote bag crafted with woven bamboo grid panels and reinforced cotton canvas inner lining.',
      base_price: 980,
      active: true,
      featured: true,
      variants: [
        { sku: 'BAG-TOT-NAT', price: 980, stock_qty: 18, option_values: { Color: 'Natural Beige' } },
        { sku: 'BAG-TOT-BRN', price: 980, stock_qty: 14, option_values: { Color: 'Earth Brown' } }
      ]
    },

    // Category 4: Artisanal Home Decor
    {
      category_slug: 'home-and-decor',
      name: 'Handcrafted Woven Bamboo Pendant Lamp',
      slug: 'handcrafted-woven-bamboo-pendant-lamp',
      description: 'Intricately woven bamboo lampshade that casts warm geometric light patterns across living rooms, cafes, and dining spaces.',
      base_price: 1850,
      active: true,
      featured: true,
      variants: [
        { sku: 'LMP-BAM-SML', price: 1850, stock_qty: 10, option_values: { Size: '10-inch Diameter' } },
        { sku: 'LMP-BAM-LRG', price: 2400, stock_qty: 8, option_values: { Size: '14-inch Diameter' } }
      ]
    },
    {
      category_slug: 'home-and-decor',
      name: 'Bamboo Wall Hanging Plant Planter',
      slug: 'bamboo-wall-hanging-plant-planter',
      description: 'Vertical indoor plant holder crafted from split bamboo poles with jute hanging cords. Ideal for pothos and succulents.',
      base_price: 490,
      active: true,
      featured: false,
      variants: [
        { sku: 'PLN-WAL-SGL', price: 490, stock_qty: 30, option_values: { Tier: 'Single Pot' } },
        { sku: 'PLN-WAL-DBL', price: 720, stock_qty: 20, option_values: { Tier: 'Double Pot' } }
      ]
    },
    {
      category_slug: 'home-and-decor',
      name: 'Decorative Bamboo Table Coaster Set',
      slug: 'decorative-bamboo-table-coaster-set',
      description: 'Set of 6 heat-resistant bamboo slate coasters accompanied by a matching handcrafted wooden holder box.',
      base_price: 380,
      active: true,
      featured: false,
      variants: [
        { sku: 'CST-BAM-6PC', price: 380, stock_qty: 45, option_values: { Set: '6 Coasters with Box' } }
      ]
    },

    // Category 5: Eco-Friendly Baskets & Storage
    {
      category_slug: 'baskets-and-storage',
      name: 'Woven Bamboo Storage Basket with Lid',
      slug: 'woven-bamboo-storage-basket-with-lid',
      description: 'Multi-purpose woven bamboo hamper with fitted lid. Ideal for laundry, toy organization, or linen storage.',
      base_price: 1350,
      active: true,
      featured: true,
      variants: [
        { sku: 'BSK-STG-MED', price: 1350, stock_qty: 15, option_values: { Size: 'Medium (14x12 in)' } },
        { sku: 'BSK-STG-LRG', price: 1750, stock_qty: 10, option_values: { Size: 'Large (18x15 in)' } }
      ]
    },
    {
      category_slug: 'baskets-and-storage',
      name: 'Tiered Bamboo Fruit & Vegetable Bowl',
      slug: 'tiered-bamboo-fruit-and-vegetable-bowl',
      description: '2-tier countertop fruit basket made from sustainable bamboo slats. Keeps kitchen produce organized and well-ventilated.',
      base_price: 1200,
      active: true,
      featured: false,
      variants: [
        { sku: 'BSK-FRT-2TR', price: 1200, stock_qty: 22, option_values: { Design: '2-Tier Stand' } }
      ]
    },
    {
      category_slug: 'baskets-and-storage',
      name: 'Handcrafted Woven Bread & Snacks Basket',
      slug: 'handcrafted-woven-bread-and-snacks-basket',
      description: 'Oval dining table basket perfect for serving fresh ruti, bread, fruit, or evening snacks.',
      base_price: 420,
      active: true,
      featured: false,
      variants: [
        { sku: 'BSK-BRD-OVL', price: 420, stock_qty: 35, option_values: { Shape: 'Oval' } }
      ]
    },

    // Category 6: Bamboo Stationery & Office
    {
      category_slug: 'stationery-and-office',
      name: 'Bamboo Desktop Organizer & Phone Stand',
      slug: 'bamboo-desktop-organizer-and-phone-stand',
      description: 'Sleek wooden desk caddy with compartments for pens, business cards, sticky notes, and a built-in smartphone holder.',
      base_price: 890,
      active: true,
      featured: true,
      variants: [
        { sku: 'DSK-ORG-STD', price: 890, stock_qty: 25, option_values: { Finish: 'Natural Polish' } }
      ]
    },
    {
      category_slug: 'stationery-and-office',
      name: 'Eco Bamboo Hardcover Journal & Pen',
      slug: 'eco-bamboo-hardcover-journal-and-pen',
      description: 'Sustainable A5 notebook with polished bamboo wood cover, recycled unlined paper, and a matching bamboo ballpoint pen.',
      base_price: 650,
      active: true,
      featured: false,
      variants: [
        { sku: 'JRN-BAM-A5', price: 650, stock_qty: 40, option_values: { Paper: 'Unlined Craft Paper' } }
      ]
    },
    {
      category_slug: 'stationery-and-office',
      name: 'Handmade Bamboo Pen Holder Cup',
      slug: 'handmade-bamboo-pen-holder-cup',
      description: 'Natural bamboo cylinder desk cup for pens, pencils, and art supplies. Features a smooth hand-sanded finish.',
      base_price: 290,
      active: true,
      featured: false,
      variants: [
        { sku: 'PEN-HOU-CYL', price: 290, stock_qty: 50, option_values: { Type: 'Single Cylinder' } }
      ]
    },
    {
      category_slug: 'bamboo-crafts',
      name: 'E2E Test Bamboo Product',
      slug: 'e2e-test-bamboo-product',
      description: 'An active bamboo test product crafted for sustainable dining and Playwright checkout flow tests.',
      base_price: 250,
      active: true,
      featured: true,
      variants: [
        { sku: 'E2E-TEST-SKU-001', price: 250, stock_qty: 150, option_values: { Style: 'Standard' } }
      ]
    }
  ]

  for (const item of productsToInsert) {
    const category_id = categoryMap.get(item.category_slug)
    if (!category_id) continue

    const { data: prodData, error: prodErr } = await supabase
      .from('products')
      .insert({
        category_id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        base_price: item.base_price,
        active: item.active,
        featured: item.featured
      })
      .select()
      .single()

    if (prodErr || !prodData) {
      console.error(`Failed inserting product ${item.name}:`, prodErr)
      continue
    }

    const variantRecords = item.variants.map((v) => ({
      product_id: prodData.id,
      sku: v.sku,
      price: v.price,
      stock_qty: v.stock_qty,
      active: true,
      option_values: v.option_values
    }))

    const { error: varErr } = await supabase
      .from('product_variants')
      .insert(variantRecords)

    if (varErr) {
      console.error(`Failed inserting variants for ${item.name}:`, varErr)
    }
  }

  console.log('Database successfully cleared and populated with mock products!')
}

seed().catch(console.error)
