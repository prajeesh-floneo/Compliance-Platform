import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const item_id = searchParams.get("item_id");
  let logs = db().activityLogs;
  if (item_id) logs = logs.filter((l) => l.item_id === item_id);
  return NextResponse.json({ logs });
}
