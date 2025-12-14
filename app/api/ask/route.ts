import { NextResponse } from "next/server";

const KESTRA_BASE = "http://localhost:8080";
const AUTH = process.env.KESTRA_BASIC_AUTH!;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt missing" }, { status: 400 });
    }

    // 1️⃣ Trigger execution (PATH-BASED — works in your Kestra)
    const startRes = await fetch(
      `${KESTRA_BASE}/api/v1/executions/tutorial/llama_local`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${AUTH}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: { prompt }
        })
      }
    );

    if (!startRes.ok) {
      throw new Error("Failed to start execution");
    }

    const startData = await startRes.json();
    const executionId = startData.id;

    // 2️⃣ Poll execution until finished (max ~90s)
    for (let i = 0; i < 30; i++) {
      await sleep(3000);

      const statusRes = await fetch(
        `${KESTRA_BASE}/api/v1/executions/${executionId}`,
        {
          headers: {
            "Authorization": `Basic ${AUTH}`
          },
          cache: "no-store"
        }
      );

      const statusData = await statusRes.json();

      if (statusData.state === "SUCCESS") {
        const stdout =
          statusData?.taskRunList?.[0]?.outputs?.stdout?.[0] ??
          "No output";

        return NextResponse.json({ answer: stdout });
      }

      if (statusData.state === "FAILED") {
        throw new Error("Execution failed");
      }
    }

    throw new Error("Execution timeout");
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
