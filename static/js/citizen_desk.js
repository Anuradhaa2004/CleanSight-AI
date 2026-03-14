(function () {
    const body = document.body;
    const data = {
        tracking: body.dataset.tracking || "NA",
        category: body.dataset.category || "General Waste",
        status: body.dataset.status || "Pending",
        user: body.dataset.user || "Citizen",
        ward: body.dataset.ward || "0",
        lat: Number.parseFloat(body.dataset.lat || "0"),
        lon: Number.parseFloat(body.dataset.lon || "0"),
        image: body.dataset.image || "",
    };

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function setStatusClass(el, statusText) {
        if (!el) return;
        const s = String(statusText).toLowerCase();
        el.classList.remove("pending", "assigned", "resolved", "verification", "closed");
        if (s.includes("verification")) {
            el.classList.add("verification");
        } else if (s.includes("closed")) {
            el.classList.add("closed");
        } else if (s.includes("resolved")) {
            el.classList.add("resolved");
        } else if (s.includes("assign")) {
            el.classList.add("assigned");
        } else {
            el.classList.add("pending");
        }
    }

    function formatToday() {
        const now = new Date();
        return now.toLocaleString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function initHeader() {
        let loggedUser = null;
        try {
            loggedUser = JSON.parse(localStorage.getItem("cleanSightUser") || "null");
        } catch (e) {
            loggedUser = null;
        }
        const userName = loggedUser && loggedUser.name ? loggedUser.name : data.user;

        setText("todayText", formatToday());
        setText("sideUserName", userName);
        setText("trackingCode", data.tracking);
        setText("categoryText", data.category);
        setText("statusText", data.status);
        setText("wardText", "Ward " + data.ward);
        setText("coordText", data.lat.toFixed(5) + ", " + data.lon.toFixed(5));

        const sideProfileImg = document.getElementById("sideProfileImg");
        if (sideProfileImg && loggedUser && loggedUser.profileUrl) {
            sideProfileImg.src = loggedUser.profileUrl;
            sideProfileImg.onerror = function () {
                sideProfileImg.src = "/static/images/profile.png";
            };
        }

        const mapBtn = document.getElementById("mapBtn");
        if (mapBtn) {
            mapBtn.href = "https://www.google.com/maps?q=" + encodeURIComponent(String(data.lat) + "," + String(data.lon));
        }

        const evidenceImage = document.getElementById("evidenceImage");
        if (evidenceImage) {
            evidenceImage.src = data.image || "/static/images/success_ai.png";
            evidenceImage.onerror = function () {
                evidenceImage.src = "/static/images/success_ai.png";
            };
        }
    }

    function initTable() {
        let loggedUser = null;
        try {
            loggedUser = JSON.parse(localStorage.getItem("cleanSightUser") || "null");
        } catch (e) {
            loggedUser = null;
        }
        setText("tbUser", loggedUser && loggedUser.name ? loggedUser.name : data.user);
        setText("tbCategory", data.category);
        setText("tbWard", "Ward " + data.ward);
        setText("tbCoord", data.lat.toFixed(5) + ", " + data.lon.toFixed(5));
        setText("tbStatus", data.status);
        const tbStatus = document.getElementById("tbStatus");
        const statusPill = document.getElementById("statusPill");
        if (statusPill) {
            statusPill.textContent = data.status;
        }
        setStatusClass(tbStatus, data.status);
        setStatusClass(statusPill, data.status);
    }

    function drawRing(canvasId, value, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = 40;

        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = 10;

        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        const start = -Math.PI / 2;
        const end = start + (Math.PI * 2 * Math.max(0, Math.min(100, value))) / 100;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.arc(cx, cy, radius, start, end);
        ctx.stroke();

        ctx.fillStyle = "#eaf0ff";
        ctx.font = "700 16px Sora";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(Math.round(value)) + "%", cx, cy);
    }

    function drawTrend() {
        const canvas = document.getElementById("trendCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const pad = 24;
        const values = [40, 52, 39, 63, 46, 57, 50];
        const xGap = (w - pad * 2) / (values.length - 1);
        const yMax = 80;

        ctx.clearRect(0, 0, w, h);

        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "rgba(238, 106, 191, 0.45)");
        grad.addColorStop(1, "rgba(87, 98, 248, 0.05)");

        ctx.beginPath();
        values.forEach(function (v, i) {
            const x = pad + i * xGap;
            const y = h - pad - ((h - pad * 2) * v) / yMax;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.lineTo(w - pad, h - pad);
        ctx.lineTo(pad, h - pad);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        values.forEach(function (v, i) {
            const x = pad + i * xGap;
            const y = h - pad - ((h - pad * 2) * v) / yMax;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ff95cc";
        ctx.stroke();

        values.forEach(function (v, i) {
            const x = pad + i * xGap;
            const y = h - pad - ((h - pad * 2) * v) / yMax;
            ctx.beginPath();
            ctx.fillStyle = "#ffffff";
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function hasValidCoords(lat, lon) {
        return (
            Number.isFinite(lat) &&
            Number.isFinite(lon) &&
            lat >= -90 &&
            lat <= 90 &&
            lon >= -180 &&
            lon <= 180 &&
            !(lat === 0 && lon === 0)
        );
    }

    function getCoordsFromDataset() {
        const lat = Number.parseFloat(document.body.dataset.lat || "0");
        const lon = Number.parseFloat(document.body.dataset.lon || "0");
        return { lat: lat, lon: lon };
    }

    function getBrowserLocation() {
        return new Promise(function (resolve, reject) {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation not supported"));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    resolve({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                    });
                },
                function (err) {
                    reject(err);
                },
                { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
            );
        });
    }

    async function getLiveAQI() {
        const aqiValueEl = document.getElementById("aqiLevelDisplay");
        const aqiStatusEl = document.getElementById("aqiStatusText");
        const aqiCardEl = document.getElementById("aqiCard");
        if (!aqiValueEl || !aqiStatusEl) return;

        function resetAQIClasses() {
            aqiValueEl.classList.remove("aqi-good", "aqi-mod", "aqi-poor");
            if (aqiCardEl) {
                aqiCardEl.classList.remove("aqi-good-card", "aqi-mod-card", "aqi-poor-card");
            }
        }

        try {
            const datasetCoords = getCoordsFromDataset();
            let lat = datasetCoords.lat;
            let lon = datasetCoords.lon;
            if (!hasValidCoords(lat, lon)) {
                try {
                    const geo = await getBrowserLocation();
                    lat = geo.lat;
                    lon = geo.lon;
                } catch (geoErr) {
                    // Fallback to default coordinates (Bhopal) if browser location is unavailable.
                    lat = 23.2599;
                    lon = 77.4126;
                }
            }

            const url =
                "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" +
                encodeURIComponent(String(lat)) +
                "&longitude=" +
                encodeURIComponent(String(lon)) +
                "&current=us_aqi";
            const res = await fetch(url);
            const payload = await res.json();

            if (!payload || !payload.current || payload.current.us_aqi === undefined || payload.current.us_aqi === null) {
                throw new Error("Invalid AQI payload");
            }

            const aqi = Number(payload.current.us_aqi);
            resetAQIClasses();
            aqiValueEl.textContent = Number.isFinite(aqi) ? String(aqi) : "N/A";

            if (!Number.isFinite(aqi)) {
                aqiStatusEl.textContent = "N/A";
                return;
            }

            if (aqi < 50) {
                aqiValueEl.classList.add("aqi-good");
                if (aqiCardEl) aqiCardEl.classList.add("aqi-good-card");
                aqiStatusEl.textContent = "Good";
            } else if (aqi <= 100) {
                aqiValueEl.classList.add("aqi-mod");
                if (aqiCardEl) aqiCardEl.classList.add("aqi-mod-card");
                aqiStatusEl.textContent = "Moderate";
            } else {
                aqiValueEl.classList.add("aqi-poor");
                if (aqiCardEl) aqiCardEl.classList.add("aqi-poor-card");
                aqiStatusEl.textContent = "Poor";
            }
        } catch (e) {
            resetAQIClasses();
            aqiValueEl.textContent = "N/A";
            aqiStatusEl.textContent = "N/A";
        }
    }

    function getScoresFromStatus(statusText) {
        const s = String(statusText).toLowerCase();
        if (s.includes("closed") || s.includes("resolved")) return [92, 90, 40, 96];
        if (s.includes("verification")) return [88, 86, 46, 86];
        if (s.includes("assign")) return [86, 84, 62, 74];
        return [78, 80, 70, 52];
    }

    function initCharts() {
        const scores = getScoresFromStatus(data.status);
        drawRing("ringOne", scores[0], "#3de0a2");
        drawRing("ringTwo", scores[1], "#8f6fff");
        drawRing("ringThree", scores[2], "#ff9f5e");
        drawRing("ringFour", scores[3], "#36c9ff");
        drawTrend();
    }

    initHeader();
    initTable();
    initCharts();
    window.addEventListener("load", function () {
        getLiveAQI();
    });
    window.addEventListener("resize", initCharts);
})();
