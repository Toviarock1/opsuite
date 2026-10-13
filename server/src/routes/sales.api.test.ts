import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

// Endpoint tests hit a real database: run with `npm run test:api`
// and a filled-in server/.env. Every row created here carries the
// tag below, so teardown wipes leftovers even if a test fails midway.
const TAG = `E2E-${Date.now()}`;

let baseUrl = "";
let server: Server | undefined;

beforeAll(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  if (!server) throw new Error("Test server failed to start");
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await prisma.sale.deleteMany({ where: { itemName: { startsWith: "E2E-" } } });
  await new Promise<void>((resolve) => {
    if (server) server.close(() => resolve());
    else resolve();
  });
  await prisma.$disconnect();
});

async function postSale(body: unknown) {
  const res = await fetch(`${baseUrl}/api/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return {
    status: res.status,
    json: (await res.json()) as { sale?: { id: number }; error?: string },
  };
}

describe("sales endpoints", () => {
  it("GET /health returns ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("POST rejects invalid input with 400", async () => {
    const { status, json } = await postSale({ itemName: "", amount: -5, soldAt: "bad" });
    expect(status).toBe(400);
    expect(typeof json.error === "string" && json.error.length > 0).toBe(true);
  });

  it(
    "POST creates, search finds, pagination shapes, PUT edits, DELETE removes",
    async () => {
    const name = `${TAG}-Peak milk tin`;

    const created = await postSale({
      itemName: name,
      amount: 1200,
      soldAt: new Date().toISOString(),
    });
    expect(created.status).toBe(201);
    const id = created.json.sale?.id;
    expect(typeof id).toBe("number");
    if (typeof id !== "number") throw new Error("Create did not return an id");

    const searchRes = await fetch(`${baseUrl}/api/sales/today?search=${encodeURIComponent(name)}`);
    expect(searchRes.status).toBe(200);
    const search = (await searchRes.json()) as {
      sales: { id: number }[];
      total: number;
      page: number;
      totalPages: number;
      totalCount: number;
    };
    expect(search.sales.some((sale) => sale.id === id)).toBe(true);
    expect(search.total).toBeGreaterThanOrEqual(1200);
    expect(search.totalCount).toBeGreaterThanOrEqual(1);

    const pageRes = await fetch(`${baseUrl}/api/sales/today?page=1&pageSize=1`);
    expect(pageRes.status).toBe(200);
    const page = (await pageRes.json()) as { sales: unknown[]; totalPages: number };
    expect(page.sales.length).toBeLessThanOrEqual(1);
    expect(page.totalPages).toBeGreaterThanOrEqual(1);

    const putRes = await fetch(`${baseUrl}/api/sales/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemName: `${TAG}-edited`,
        amount: 1500,
        soldAt: new Date().toISOString(),
      }),
    });
    expect(putRes.status).toBe(200);

    const badId = await fetch(`${baseUrl}/api/sales/abc`, { method: "DELETE" });
    expect(badId.status).toBe(400);

    const delRes = await fetch(`${baseUrl}/api/sales/${id}`, { method: "DELETE" });
    expect(delRes.status).toBe(204);

    const delAgain = await fetch(`${baseUrl}/api/sales/${id}`, { method: "DELETE" });
    expect(delAgain.status).toBe(404);
    },
    // Eight sequential calls against free-tier Postgres need room.
    60_000,
  );

  it("GET search with no match returns empty and zero total", async () => {
    const res = await fetch(`${baseUrl}/api/sales/today?search=${TAG}-no-such-item`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { sales: unknown[]; total: number };
    expect(data.sales).toEqual([]);
    expect(data.total).toBe(0);
  });
});
