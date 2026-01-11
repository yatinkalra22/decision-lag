import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "not logged in" }, { status: 401 });

  const res = await fetch(`${session.instanceUrl}/services/data/v60.0/sobjects`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const data = await res.json();

  // Return only names so it’s searchable
  const names = (data?.sobjects ?? []).map((o: any) => o.name);

  return NextResponse.json({
    instanceUrl: session.instanceUrl,
    total: names.length,
    containsDecisionInsight: names.includes("Decision_Insight__c"),
    namesSample: names.slice(0, 50),
  });
}
