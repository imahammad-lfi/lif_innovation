import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as L from "lucide-react";
import { mkdirSync, writeFileSync } from "node:fs";
const out = "/home/ubuntu/linkfields/seed/assets/custom/icons/sub/";
mkdirSync(out, { recursive: true });
export const map = {
  "app-modernisation": "AppWindow", "automation-rpa": "Bot", "integration-services": "Cable",
  "whatsapp-omnichannel": "MessagesSquare", "quality-engineering": "BadgeCheck", "cloud-services": "Cloud",
  "sap-s4hana": "Factory", "microsoft-dynamics-365": "LayoutDashboard", "odoo": "Blocks", "zoho": "Briefcase",
  "salesforce": "Handshake", "platform-migration-ams": "ArrowLeftRight",
  "ai-strategy-governance": "Target", "agentic-ai-genai": "Sparkles", "data-platforms-analytics": "ChartColumn",
  "machine-learning": "BrainCircuit",
  "ai-security-grc": "ShieldCheck", "cloud-security-iam": "KeyRound", "exposure-validation-appsec": "ScanSearch",
  "security-operations": "Radar",
  "technology-advisory": "Presentation", "specialist-talent-managed-teams": "UsersRound", "gcc-strategy-setup": "Earth",
  "gcc-build-operate-transfer": "Building",
  "linkworks": "Link2", "testoriumz": "FlaskConical", "textiq": "ScanText", "finsight": "ChartLine", "edupilot": "GraduationCap",
  "vajrax": "Zap", "vectorx": "Crosshair", "ai-governance": "Scale", "staff-augmentation": "UserPlus", "managed-teams": "UsersRound",
};
let bad = 0;
for (const [file, name] of Object.entries(map)) {
  const Icon = L[name];
  if (!Icon) { console.log("MISSING", file, name); bad++; continue; }
  let svg = renderToStaticMarkup(createElement(Icon, { size: 144, color: "#FF7800", strokeWidth: 2, "aria-hidden": "true" }));
  svg = svg.replace(/ class="[^"]*"/, "");
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  writeFileSync(out + file + ".svg", svg);
}
console.log("written", Object.keys(map).length - bad, "missing", bad);
