window.cleanSightAuth = {
  storageKey: "cleanSightUser",

  isLoggedIn: function () {
    return !!this.getUser();
  },

  getUser: function () {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const user = JSON.parse(raw);
      if (!user || !user.name) return null;
      return user;
    } catch (e) {
      return null;
    }
  },

  getCookie: function (name) {
    const target = name + "=";
    const parts = document.cookie ? document.cookie.split(";") : [];
    for (let i = 0; i < parts.length; i += 1) {
      const cookie = parts[i].trim();
      if (cookie.indexOf(target) === 0) {
        try {
          return decodeURIComponent(cookie.substring(target.length));
        } catch (e) {
          return cookie.substring(target.length);
        }
      }
    }
    return "";
  },

  syncUserFromCookies: function () {
    const cookieName = this.getCookie("cs_user_name");
    if (!cookieName) return;
    const cookieEmail = this.getCookie("cs_user_email");
    const cookieProfile = this.getCookie("cs_user_profile");

    const currentUser = this.getUser();
    if (
      currentUser &&
      currentUser.name === cookieName &&
      (currentUser.email || "") === cookieEmail &&
      (currentUser.profileUrl || "") === cookieProfile
    ) {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        name: cookieName,
        email: cookieEmail,
        profileUrl: cookieProfile
      }));
    } catch (e) {
      console.error("Cookie sync failed", e);
    }
  },

  getAvatarUrl: function (user) {
    const name = (user && user.name) ? user.name : "Citizen";
    const fallback = "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=4caf50&color=ffffff&size=256";
    if (user && user.profileUrl && /^https?:\/\//i.test(user.profileUrl)) {
      return user.profileUrl;
    }
    return fallback;
  },

  logout: function () {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error("Logout storage clear failed", e);
    }
  },

  initAuthUI: function () {
    const authContainer = document.getElementById("authContainer");
    if (!authContainer) return;

    const user = this.getUser();
    if (!user) return;

    const avatar = this.getAvatarUrl(user);
    authContainer.innerHTML = "";
    authContainer.className = "d-flex align-items-center gap-2";
    authContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <img src="${avatar}" alt="Profile" class="profile-avatar rounded-circle" width="34" height="34" style="border:2px solid #ffffff; object-fit:cover;" onerror="this.src='https://ui-avatars.com/api/?name=Citizen&background=4caf50&color=ffffff&size=256'">
        <span class="fw-semibold" style="max-width:140px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${user.name}</span>
        <a href="#" id="logoutBtn" class="btn btn-sm btn-outline-secondary">Logout</a>
      </div>
    `;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.cleanSightAuth.logout();
        window.location.href = "/logout";
      });
    }
  },

  requireAuthForReportLinks: function () {
    const targets = [document.getElementById("reportIssueBtn"), document.getElementById("finalCtaBtn")];
    const loggedIn = this.isLoggedIn();
    targets.forEach(function (link) {
      if (!link) return;
      link.addEventListener("click", function (e) {
        if (loggedIn) return;
        e.preventDefault();
        window.location.href = "/login?mode=login&next=/report";
      });
    });
  },

  initCitizenDeskButton: function () {
    const btn = document.getElementById("citizenDeskBtn");
    if (!btn) return;
    const hasSubmitted = localStorage.getItem("hasSubmittedReport") === "1";
    const latestDeskUrl = localStorage.getItem("latestCitizenDeskUrl") || "";
    const fallbackDeskUrl = "/citizen-desk";
    if (hasSubmitted && latestDeskUrl) {
      btn.classList.remove("d-none");
      btn.setAttribute("href", latestDeskUrl);
    } else {
      btn.classList.add("d-none");
      btn.setAttribute("href", fallbackDeskUrl);
    }
  },

  syncCitizenDeskSidebar: function () {
    const user = this.getUser();
    if (!user) return;
    const sideName = document.getElementById("sideUserName");
    const sideImg = document.getElementById("sideProfileImg");
    if (sideName) sideName.textContent = user.name;
    if (sideImg) {
      sideImg.src = this.getAvatarUrl(user);
      sideImg.onerror = function () {
        sideImg.src = "https://ui-avatars.com/api/?name=Citizen&background=4caf50&color=ffffff&size=256";
      };
    }
  }
};

document.addEventListener("DOMContentLoaded", function () {
  if (!window.cleanSightAuth) return;
  window.cleanSightAuth.syncUserFromCookies();
  window.cleanSightAuth.initAuthUI();
  window.cleanSightAuth.requireAuthForReportLinks();
  window.cleanSightAuth.initCitizenDeskButton();
  window.cleanSightAuth.syncCitizenDeskSidebar();
});
