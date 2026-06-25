import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ADMIN_EMAILS } from "../../../../admin/constants";

export async function PUT(request, { params }) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    return new NextResponse("Unauthorized: Admin login required", { status: 401 });
  }

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "";
  const email = primaryEmail.toLowerCase();

  const isDevelopment = process.env.NODE_ENV !== "production";
  if (!ADMIN_EMAILS.includes(email) && !isDevelopment) {
    return new NextResponse("Forbidden: Allowed administrators only", { status: 403 });
  }

  try {
    const body = await request.json();
    body.adminEmail = email;
    const backendBase = process.env.BACKEND_URL || "http://127.0.0.1:5001";
    const backendUrl = `${backendBase}/issues/${id}`;
    const adminApiKey = process.env.ADMIN_API_KEY || "civicconnect_secure_admin_key_2026";

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "role": "admin",
        "x-admin-api-key": adminApiKey
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      return new NextResponse(errText, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Secure API Proxy Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
