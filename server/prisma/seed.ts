import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedSale = {
  itemName: string;
  amount: number;
  soldAt: string; // ISO string with +01:00 offset so Lagos time is explicit
};

// One believable trading day in Lagos (WAT = UTC+1, no DST).
// Prices are whole naira.
const SALES: SeedSale[] = [
  {
    itemName: "Indomie carton",
    amount: 12500,
    soldAt: "2026-10-13T08:05:00+01:00",
  },
  {
    itemName: "Peak milk tin",
    amount: 1200,
    soldAt: "2026-10-13T08:40:00+01:00",
  },
  {
    itemName: "Bread (Agege)",
    amount: 1500,
    soldAt: "2026-10-13T09:15:00+01:00",
  },
  {
    itemName: "Coca-Cola crate",
    amount: 6800,
    soldAt: "2026-10-13T10:02:00+01:00",
  },
  {
    itemName: "Rice (Derica, 1 painter)",
    amount: 9500,
    soldAt: "2026-10-13T10:45:00+01:00",
  },
  {
    itemName: "Phone charger",
    amount: 4500,
    soldAt: "2026-10-13T11:20:00+01:00",
  },
  {
    itemName: "Dettol soap (3 pack)",
    amount: 2800,
    soldAt: "2026-10-13T12:10:00+01:00",
  },
  {
    itemName: "Groundnut oil (2L)",
    amount: 8900,
    soldAt: "2026-10-13T13:30:00+01:00",
  },
  {
    itemName: "Airtime (MTN)",
    amount: 1000,
    soldAt: "2026-10-13T14:15:00+01:00",
  },
  { itemName: "Egg crate", amount: 6200, soldAt: "2026-10-13T15:40:00+01:00" },
  {
    itemName: "Sachet water (bag)",
    amount: 800,
    soldAt: "2026-10-13T17:05:00+01:00",
  },
  {
    itemName: "Noodles + egg (eaten)",
    amount: 900,
    soldAt: "2026-10-13T19:25:00+01:00",
  },
];

async function main() {
  for (const sale of SALES) {
    await prisma.sale.create({
      data: {
        itemName: sale.itemName,
        amount: sale.amount,
        soldAt: new Date(sale.soldAt),
      },
    });
  }
  console.log(`Seeded ${SALES.length} sales.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
