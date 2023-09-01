import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const scope = searchParams.get("scope");

  const res = await fetch(`https://ehzn622uci.execute-api.eu-central-1.amazonaws.com/api/strava/exchange_token?code=${code}&scope=${scope}`);
  if (res.status === 200) {
    console.log("auth success");
    redirect("/");
  } else {
    console.log("auth failed");
    redirect("/");
  }
}