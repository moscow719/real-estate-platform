import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionId = request.headers.get("x-view-session-id");
  if (!sessionId || !SESSION_ID_PATTERN.test(sessionId)) {
    return new Response(null, { status: 400 });
  }

  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { id, status: "PUBLISHED" },
    select: { id: true, ownerId: true },
  });
  if (!property) return new Response(null, { status: 204 });

  const session = await auth();
  if (session?.user?.id === property.ownerId) {
    return new Response(null, { status: 204 });
  }

  const now = new Date();
  const day = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  await prisma.propertyView.createMany({
    data: [
      {
        propertyId: property.id,
        sessionId,
        userId: session?.user?.id ?? null,
        day,
      },
    ],
    skipDuplicates: true,
  });

  return new Response(null, { status: 204 });
}
