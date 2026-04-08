export function buildWeeklyDigestEmail(data: {
  parentName: string;
  childName: string;
  weekEnding: string;  // "April 7, 2026"
  sessionsThisWeek: number;
  totalMinutes: number;
  streakDays: number;
  skillsImproved: { name: string; improvement: string }[];
  focusAreas: { name: string; tip: string }[];
  nextActions: string[];  // 2-3 actionable items
}) {
  const { parentName, childName, weekEnding, sessionsThisWeek, totalMinutes,
    streakDays, skillsImproved, focusAreas, nextActions } = data;

  const subject = `${childName}'s WonderQuest week — ${weekEnding}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7ff;font-family:system-ui,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#9b72ff,#2dd4bf);padding:32px 32px 24px;text-align:center">
      <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.03em">
        Wonder<span style="color:#fbbf24">Quest</span>
      </div>
      <div style="color:rgba(255,255,255,0.85);font-size:14px;margin-top:4px">Weekly Learning Digest</div>
    </div>

    <!-- Greeting -->
    <div style="padding:28px 32px 0">
      <p style="font-size:17px;color:#1e1b4b;margin:0 0 4px">Hi ${parentName},</p>
      <p style="font-size:15px;color:#64748b;margin:0">Here's ${childName}'s learning summary for the week ending ${weekEnding}.</p>
    </div>

    <!-- Stats row -->
    <div style="display:flex;gap:12px;padding:20px 32px;flex-wrap:wrap">
      ${[
        { label: "Sessions", value: String(sessionsThisWeek), icon: "🎮" },
        { label: "Minutes", value: String(totalMinutes), icon: "⏱" },
        { label: "Day streak", value: String(streakDays) + "🔥", icon: "" },
      ].map(s => `
        <div style="flex:1;min-width:120px;background:#f8f7ff;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:24px;font-weight:900;color:#9b72ff">${s.value}</div>
          <div style="font-size:12px;color:#64748b;font-weight:600;margin-top:2px">${s.label}</div>
        </div>
      `).join("")}
    </div>

    ${skillsImproved.length > 0 ? `
    <!-- Skills improved -->
    <div style="padding:0 32px 20px">
      <h3 style="font-size:14px;font-weight:800;color:#1e1b4b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 12px">✨ Skills improving</h3>
      ${skillsImproved.slice(0,3).map(s => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f0fdf4;border-radius:8px;margin-bottom:6px">
          <span style="font-size:14px;color:#166534;font-weight:600">${s.name}</span>
          <span style="font-size:13px;color:#15803d">${s.improvement}</span>
        </div>
      `).join("")}
    </div>
    ` : ""}

    ${focusAreas.length > 0 ? `
    <!-- Focus areas -->
    <div style="padding:0 32px 20px">
      <h3 style="font-size:14px;font-weight:800;color:#1e1b4b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 12px">🎯 Keep working on</h3>
      ${focusAreas.slice(0,2).map(f => `
        <div style="padding:12px 14px;background:#fff7ed;border-left:3px solid #f97316;border-radius:0 8px 8px 0;margin-bottom:8px">
          <div style="font-size:14px;font-weight:700;color:#9a3412">${f.name}</div>
          <div style="font-size:13px;color:#c2410c;margin-top:2px">${f.tip}</div>
        </div>
      `).join("")}
    </div>
    ` : ""}

    <!-- Next actions -->
    <div style="padding:0 32px 24px">
      <h3 style="font-size:14px;font-weight:800;color:#1e1b4b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 12px">💡 What to do this week</h3>
      ${nextActions.slice(0,3).map((action, i) => `
        <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9">
          <span style="font-size:13px;font-weight:800;color:#9b72ff;min-width:20px">${i+1}.</span>
          <span style="font-size:14px;color:#334155">${action}</span>
        </div>
      `).join("")}
    </div>

    <!-- CTA -->
    <div style="padding:20px 32px 32px;text-align:center">
      <a href="https://wonderquest-learning.onrender.com/parent/weekly"
         style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#9b72ff,#7c3aed);color:#ffffff;font-weight:800;font-size:15px;text-decoration:none;border-radius:12px">
        View full report →
      </a>
    </div>

    <!-- Footer -->
    <div style="background:#f8f7ff;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="font-size:12px;color:#94a3b8;margin:0">
        WonderQuest Learning · COPPA-designed · Ad-free<br>
        <a href="https://wonderquest-learning.onrender.com/parent/account" style="color:#94a3b8">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${parentName},\n\n${childName}'s WonderQuest week (${weekEnding}):\n- Sessions: ${sessionsThisWeek}\n- Minutes: ${totalMinutes}\n- Streak: ${streakDays} days\n\nWhat to do this week:\n${nextActions.map((a,i) => `${i+1}. ${a}`).join("\n")}\n\nView the full report: https://wonderquest-learning.onrender.com/parent/weekly`;

  return { subject, html, text };
}
