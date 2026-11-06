import { readBody } from "../../validation";
import type { RouteContext } from "../../context";

export function createHandlers({ store, env }: RouteContext) {

// Verify reCAPTCHA token
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY is not configured");
    return false;
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    });

    const data = await response.json<{ success?: boolean }>();
    return data.success === true;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return false;
  }
}

async function POST(request: Request) {
  try {
    const body = await readBody(request, "helpdesk");
    const { nama, nomorWhatsapp, kategoriPengaduan, pesanPengaduan, recaptchaToken } = body;

    // Validate required fields
    if (!nama || !nomorWhatsapp || !kategoriPengaduan || !pesanPengaduan || !recaptchaToken) {
      return Response.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // The development bypass is controlled by server configuration only.
    if (env.APP_ENV !== 'development' || env.RECAPTCHA_SECRET_KEY) {
      if (!env.RECAPTCHA_SECRET_KEY || !(await verifyRecaptcha(recaptchaToken))) {
        return Response.json({ error: "Verifikasi reCAPTCHA gagal" }, { status: 400 });
      }
    }

    // Validate kategori pengaduan
    const validKategori = ["umum", "kesehatan", "keamanan", "kebersihan"];
    if (!validKategori.includes(kategoriPengaduan)) {
      return Response.json(
        { error: "Kategori pengaduan tidak valid" },
        { status: 400 }
      );
    }

    // Save to database
    const helpdesk = await store.helpdesk.create({
      data: {
        nama,
        nomorWhatsapp,
        kategoriPengaduan,
        pesanPengaduan,
        status: "pending",
        createdAt: new Date(),
      },
    });

    return Response.json(
      {
        message: "Pengaduan berhasil dikirim",
        id: helpdesk.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating helpdesk entry:", error);
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const kategori = searchParams.get("kategori");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      status?: string;
      kategoriPengaduan?: string;
    } = {};
    if (status) where.status = status;
    if (kategori) where.kategoriPengaduan = kategori;

    // Get helpdesk entries with pagination
    const [helpdesks, total] = await Promise.all([
      store.helpdesk.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      store.helpdesk.count({ where }),
    ]);

    return Response.json({
      helpdesks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching helpdesk entries:", error);
    return Response.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
return { POST, GET };
}
