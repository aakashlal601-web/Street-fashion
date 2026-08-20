// Seeds demo catalog data and default store settings.
// Deliberately does NOT create an admin account — run `npm run create-admin` for that,
// so credentials never live in source control or seed history.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES_DEMO = [
  { name: 'Blackout Oversized Hoodie', category: 'Hoodies', price: 78, discountPrice: 59, sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Grey'], stock: 24, description: 'Heavyweight 450gsm fleece, dropped shoulders, boxy fit.', imageUrl: 'https://picsum.photos/seed/sf-hoodie1/600/750' },
  { name: 'Concrete Cargo Pants', category: 'Cargo Pants', price: 92, discountPrice: null, sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Beige', 'Olive', 'Black'], stock: 4, description: 'Six-pocket tactical cargo with adjustable ankle cuffs.', imageUrl: 'https://picsum.photos/seed/sf-cargo1/600/750' },
  { name: 'Static Graphic Tee', category: 'T-Shirts', price: 38, discountPrice: 25, sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black'], stock: 61, description: '220gsm heavyweight cotton, oversized fit.', imageUrl: 'https://picsum.photos/seed/sf-tee1/600/750' },
  { name: 'Nightshift Bomber Jacket', category: 'Jackets', price: 145, discountPrice: null, sizes: ['M', 'L', 'XL'], colors: ['Black', 'Navy'], stock: 2, description: 'Water-resistant shell, quilted lining.', imageUrl: 'https://picsum.photos/seed/sf-jacket1/600/750' },
  { name: 'Vandal High-Top Sneakers', category: 'Sneakers', price: 118, discountPrice: 99, sizes: ['S', 'M', 'L'], colors: ['White', 'Black', 'Red'], stock: 0, description: 'Vulcanized rubber sole, canvas upper.', imageUrl: 'https://picsum.photos/seed/sf-sneaker1/600/750' },
  { name: 'Grid Utility Beanie', category: 'Accessories', price: 22, discountPrice: null, sizes: ['S', 'M'], colors: ['Black', 'Yellow', 'Grey'], stock: 40, description: 'Ribbed knit beanie with woven tab logo.', imageUrl: 'https://picsum.photos/seed/sf-beanie1/600/750' },
];

async function main() {
  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  for (const p of CATEGORIES_DEMO) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  console.log('Seed complete: demo products + default settings.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
