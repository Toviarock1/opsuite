import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getLagosDayRange } from "../utils/lagosDay.js";
import { validateSaleInput } from "../validation/saleValidation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

// Today's sales in Lagos time, plus a DB-side total (SUM, never in the browser).
// Paginated newest-first so a just-logged sale shows on page 1.
router.get(
  "/today",
  asyncHandler(async (req, res) => {
    const { start, end } = getLagosDayRange();

    // Optional name filter. Trimmed, capped, case-insensitive.
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 100)
        : "";
    const where = search
      ? {
          soldAt: { gte: start, lt: end },
          itemName: { contains: search, mode: "insensitive" as const },
        }
      : { soldAt: { gte: start, lt: end } };

    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = Math.min(parsePositiveInt(req.query.pageSize, 10), 50);

    const [sales, aggregate, totalCount] = await Promise.all([
      prisma.sale.findMany({
        where,
        orderBy: [{ soldAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.sale.aggregate({ _sum: { amount: true }, where }),
      prisma.sale.count({ where }),
    ]);

    res.json({
      sales,
      total: aggregate._sum.amount ?? 0,
      page,
      pageSize,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { error, value } = validateSaleInput(req.body);
    if (!value) {
      res.status(400).json({ error: error ?? "Invalid sale." });
      return;
    }

    const sale = await prisma.sale.create({ data: value });
    res.status(201).json({ sale });
  }),
);

function parseId(param: unknown): number | null {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Forgiving pagination: garbage in gets the default, never a 400.
function parsePositiveInt(param: unknown, fallback: number): number {
  const value = Number(param);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid sale id." });
      return;
    }
    const { error, value } = validateSaleInput(req.body);
    if (!value) {
      res.status(400).json({ error: error ?? "Invalid sale." });
      return;
    }

    try {
      const sale = await prisma.sale.update({ where: { id }, data: value });
      res.json({ sale });
    } catch {
      res.status(404).json({ error: "Sale not found." });
    }
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid sale id." });
      return;
    }

    try {
      await prisma.sale.delete({ where: { id } });
      res.status(204).end();
    } catch {
      res.status(404).json({ error: "Sale not found." });
    }
  }),
);

export default router;
