import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const name = body?.name?.toString().trim() ?? "";
    const email = body?.email?.toString().trim() ?? "";
    const subject = body?.subject?.toString().trim() ?? "";
    const message = body?.message?.toString().trim() ?? "";
    const inquiryType = body?.inquiryType?.toString().trim() ?? "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Vantar nauðsynlegar upplýsingar." },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toAddress = process.env.CONTACT_TO_EMAIL;
    const fromAddress = process.env.CONTACT_FROM_EMAIL;

    if (!apiKey || !toAddress || !fromAddress) {
      console.error("Contact form email not configured: missing env vars.");
      return NextResponse.json(
        { error: "Tókst ekki að senda skilaboð (stillingar vantar)." },
        { status: 500 },
      );
    }

    const emailSubject = subject || `Ný fyrirspurn frá ${name}`;

    // Map internal inquiryType codes from the form to human-readable labels.
    const inquiryLabelMap: Record<string, string> = {
      ibudir: "Íbúðir",
      verktaekni: "Verktakaþjónusta",
      annad: "Annað",
    };
    const inquiryLabel = inquiryType ? inquiryLabelMap[inquiryType] ?? inquiryType : "";

    const textLines = [
      "📩 Ný fyrirspurn frá vefnum",
      "",
      `👤 Nafn: ${name}`,
      `📧 Netfang: ${email}`,
      inquiryLabel ? `🛠️ Tegund fyrirspurnar: ${inquiryLabel}` : "",
      subject ? `📌 Efni: ${subject}` : "",
      "",
      "💬 Skilaboð:",
      message,
    ].filter(Boolean);

    const textBody = textLines.join("\n");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        subject: emailSubject,
        text: textBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text().catch(() => "");
      console.error("Resend API error:", resendResponse.status, errorText);
      return NextResponse.json(
        { error: "Tókst ekki að senda skilaboð." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unexpected error in /api/contact:", error);
    return NextResponse.json(
      { error: "Óvænt villa kom upp." },
      { status: 500 },
    );
  }
}
