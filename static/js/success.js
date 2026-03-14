document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".success-card");
  const body = document.body;
  const citizenDeskLink = document.querySelector(".btn-citizen");

  // Trigger staged CSS animations after first paint.
  requestAnimationFrame(() => {
    body.classList.add("is-ready");
  });

  // Keep Home page Citizen Desk CTA in sync with the latest successful report.
  if (citizenDeskLink && citizenDeskLink.href) {
    try {
      localStorage.setItem("hasSubmittedReport", "1");
      localStorage.setItem("latestCitizenDeskUrl", citizenDeskLink.href);
    } catch (e) {
      // Ignore storage failures (private mode / blocked storage).
    }
  }

  if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const ease = 0.08;

  const animate = () => {
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;
    card.style.transform = `rotateX(${currentY}deg) rotateY(${currentX}deg)`;
    requestAnimationFrame(animate);
  };

  animate();

  document.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 7;
    const y = (event.clientY / window.innerHeight - 0.5) * 7;
    targetX = x * 0.28;
    targetY = -y * 0.28;
  });

  document.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });
});
