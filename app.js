const README_URL = "https://raw.githubusercontent.com/kebamt/kebamt/main/README.md";
const SOURCE_BASE = "https://github.com/kebamt/kebamt/blob/main/";
const root = document.getElementById("readme");

function rewriteUrl(href) {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|#|data:)/i.test(href)) return href;
  return SOURCE_BASE + href.replace(/^\.\//, "");
}

const renderer = {
  link({ href, title, text }) {
    const url = rewriteUrl(href);
    const titleAttr = title ? ` title="${title}"` : "";
    return `<a href="${url}"${titleAttr}>${text}</a>`;
  },
  image({ href, title, text }) {
    const url = rewriteUrl(href);
    const titleAttr = title ? ` title="${title}"` : "";
    return `<img src="${url}" alt="${text || ""}"${titleAttr}>`;
  }
};

marked.use({ gfm: true, renderer });

async function loadReadme() {
  const response = await fetch(`${README_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`README fetch failed: ${response.status}`);
  }
  const markdown = await response.text();
  root.innerHTML = marked.parse(markdown);
  wrapJsonBlocks(root);
}

function isJsonText(text) {
  const trimmed = text.trim();
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return false;
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

function wrapJsonBlocks(container) {
  container.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    const text = (code || pre).textContent || "";
    if (!isJsonText(text)) return;

    pre.classList.add("json-block");
    if (pre.closest("details")) return;

    const details = document.createElement("details");
    details.className = "json-wrap";
    details.open = true;
    const summary = document.createElement("summary");
    summary.textContent = "JSON";
    pre.replaceWith(details);
    details.append(summary, pre);
  });
}

loadReadme().catch((error) => {
  root.innerHTML = `<p>Could not load the profile README.</p><p><a href="${SOURCE_BASE}README.md">Open it on GitHub</a></p>`;
  console.error(error);
});
