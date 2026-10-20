export async function POST(req) {
  try {
    const body = await req.json();
    const { tehsil, fluoride } = body;

    // NOTE: This is a demonstration stub. Replace this function with a real call to Gemini or your chosen generative model.
    const explanation = {
      tehsil,
      fluoride,
      risk_level: fluoride > 1.5 ? 'High' : fluoride > 1.0 ? 'Moderate' : 'Safe',
      explanation: fluoride > 1.5 ? 'Concentration exceeds WHO/BIS safe limit (1.5 mg/L).' : 'Within acceptable range.',
      recommended_actions: fluoride > 1.5 ? ['Provide treated water','Install community defluoridation','Issue health advisory'] : ['Monitor periodically']
    };

    return new Response(JSON.stringify(explanation), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
