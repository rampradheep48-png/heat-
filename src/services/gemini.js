/**
 * Gemini API client for the AI-agent alert layer.
 *
 * Model choice: gemini-3.1-flash-lite. As of Aug 2026, gemini-1.5-flash and
 * gemini-2.0-flash (named in the original brief) are retired/deprecated, and
 * 2.5-flash is on its way out too — 3.1-flash-lite is Google's current
 * low-latency, cost-effective model, which fits "free-tier friendly" intent.
 * If it's since been superseded, swap MODEL below — nothing else changes.
 */

const MODEL = 'gemini-3.1-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = `You are a heat-risk alert writer for a hyperlocal dashboard covering Tamil Nadu, India.
Write exactly ONE short paragraph (3-4 sentences, under 80 words): a plain-English risk
summary followed by one concrete recommended action. Ground the language in real local
context — do not use generic "high risk" phrasing. Draw on whichever of these is most
relevant to the reading you're given:
- Outdoor/occupational workers (construction, brick-kiln laborers) exposed to radiant heat 8+ hours
- Residents of dense informal settlements with poor ventilation and elevated nighttime temperatures
- Elderly and children, who face heightened vulnerability to heat stress and hyperthermia
Tamil Nadu officially recognizes heatwaves as a state disaster, with compensation and
heat-shelter protocols in place — you may reference this as real-world context where relevant.
No headings, no markdown, no preamble — just the paragraph.`;

/**
 * @param {object} zone - from data/zones.js
 * @param {{ tempNow: number, riskLabel: string }} reading
 * @param {string} apiKey
 * @returns {Promise<string>}
 */
export async function generateHeatAlert(zone, reading, apiKey) {
  if (!apiKey) {
    return buildFallbackAlert(zone, reading);
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: JSON.stringify({
                  zone: zone.name,
                  kind: zone.kind,
                  population: zone.population,
                  current_temperature_c: reading.tempNow,
                  risk_band: reading.riskLabel,
                  data_source: reading.source,
                  context: zone.context,
                }),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini request failed (${res.status})`);
    }
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim();
    if (!text) throw new Error('Gemini returned no text');
    return text;
  } catch (err) {
    console.warn('Gemini alert generation failed, using fallback copy:', err.message);
    return buildFallbackAlert(zone, reading);
  }
}

/** Locally-generated backup paragraph so the alert feed is never blank. */
function buildFallbackAlert(zone, reading) {
  const temp = reading.tempNow?.toFixed(1) ?? '—';
  const isDense = zone.population > 200000;

  const focus = isDense
    ? `dense informal settlements and outdoor workers across ${zone.name}'s ${zone.population.toLocaleString('en-IN')} residents`
    : `${zone.name}'s smaller but still exposed population of ${zone.population.toLocaleString('en-IN')}, including elderly residents and outdoor labourers`;

  return `${zone.name} is reading ${temp}°C, placing ${focus} under ${reading.riskLabel.toLowerCase()} heat conditions. Tamil Nadu recognizes heatwaves as a state disaster with heat-shelter protocols in place — outdoor and brick-kiln workers should shift heavy labour to before 11am or after 4pm, and checks should be made on elderly residents living alone.`;
}
