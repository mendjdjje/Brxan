(function () {
  const navToggle = document.querySelector("#navToggle");
  const navLinks = document.querySelector("#navLinks");
  const modal = document.querySelector("#accountModal");
  const accountForm = document.querySelector("#accountForm");
  const toast = document.querySelector("#toast");
  const resultCard = document.querySelector("#resultCard");
  const checkerForm = document.querySelector("#checkerForm");
  const licenseInput = document.querySelector("#licenseKey");
  const annualToggle = document.querySelector("#annualToggle");
  const verifiedMetric = document.querySelector("#verifiedMetric");
  const sessionMetric = document.querySelector("#sessionMetric");

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2800);
  }

  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.querySelectorAll("[data-open-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      if (typeof modal.showModal === "function") {
        modal.showModal();
      } else {
        showToast("Your browser does not support dialogs. Demo account action skipped.");
      }
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => modal.close());
  });

  accountForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(accountForm);
    const workspace = String(form.get("workspaceName") || "").trim();
    const email = String(form.get("email") || "").trim();

    if (!workspace || !email) {
      showToast("Add a workspace name and email to continue.");
      return;
    }

    localStorage.setItem("atlasauth_workspace", JSON.stringify({ workspace, email, createdAt: new Date().toISOString() }));
    modal.close();
    accountForm.reset();
    showToast(`Demo workspace created for ${workspace}.`);
  });

  document.querySelector("#generateKey").addEventListener("click", () => {
    const part = Math.random().toString(36).slice(2, 6).toUpperCase();
    const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
    licenseInput.value = `ATLAS-${part}-${tail}`;
    licenseInput.focus();
    showToast("Generated a demo license key.");
  });

  function verifyKey(rawKey) {
    const key = rawKey.trim().toUpperCase();
    const demoPattern = /^ATLAS-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    const isValid = key === "ATLAS-DEMO-2026" || demoPattern.test(key);

    if (!isValid) {
      return {
        status: "denied",
        verified: false,
        reason: "Key format is invalid or not active in this demo environment."
      };
    }

    const seatsUsed = key === "ATLAS-DEMO-2026" ? 3 : Math.floor(Math.random() * 8) + 1;
    return {
      status: "active",
      verified: true,
      plan: key === "ATLAS-DEMO-2026" ? "Scale" : "Launch",
      expires: "2027-06-17",
      seats: `${seatsUsed}/10`,
      device: "trusted",
      region: "eu-west",
      token: `sess_${Math.random().toString(36).slice(2, 12)}`
    };
  }

  function renderVerification(response) {
    const active = response.verified;
    resultCard.innerHTML = `
      <span class="result-pill ${active ? "active" : "denied"}">${active ? "Active" : "Denied"}</span>
      <h3>${active ? "License verified" : "Verification failed"}</h3>
      <p>${active ? `Plan ${response.plan} is active. Seats used: ${response.seats}. Device state: ${response.device}.` : response.reason}</p>
      <pre><code>${JSON.stringify(response, null, 2)}</code></pre>
    `;
  }

  checkerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const response = verifyKey(licenseInput.value);
    renderVerification(response);
    showToast(response.verified ? "License accepted." : "License denied.");
  });

  annualToggle.addEventListener("change", () => {
    document.querySelectorAll("[data-monthly]").forEach((price) => {
      const value = annualToggle.checked ? price.dataset.annual : price.dataset.monthly;
      price.textContent = `$${value}`;
    });
    showToast(annualToggle.checked ? "Annual billing enabled. Prices updated." : "Monthly billing enabled. Prices updated.");
  });

  document.querySelector("#copyCode").addEventListener("click", async () => {
    const code = document.querySelector("#codeSnippet").textContent;
    try {
      await navigator.clipboard.writeText(code);
      showToast("Integration snippet copied.");
    } catch {
      showToast("Copy failed. Select the snippet manually.");
    }
  });

  window.setInterval(() => {
    const verified = Number(verifiedMetric.textContent.replace(/,/g, "")) + Math.floor(Math.random() * 4);
    const sessions = Number(sessionMetric.textContent.replace(/,/g, "")) + Math.floor(Math.random() * 3) - 1;
    verifiedMetric.textContent = verified.toLocaleString("en-US");
    sessionMetric.textContent = Math.max(1800, sessions).toLocaleString("en-US");
  }, 3000);
}());
