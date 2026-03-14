(() => {
  const section = document.querySelector("#projects[data-github-username]");
  const username = section?.getAttribute("data-github-username")?.trim();

  if (!username) return;

  const nameEl = document.getElementById("githubName");
  const bioEl = document.getElementById("githubBio");
  const avatarEl = document.getElementById("githubAvatar");
  const profileLinkEl = document.getElementById("githubProfileLink");
  const reposContainer = document.getElementById("githubProjects");
  const errorEl = document.getElementById("githubError");
  const contribContainer = document.getElementById("githubContributions");
  const contribYearEl = document.getElementById("githubContribYear");
  const contribErrorEl = document.getElementById("githubContribError");
  const contribMonthsEl = document.getElementById("githubContribMonths");

  if (!reposContainer) return;

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.remove("d-none");
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.classList.add("d-none");
  }

  function showContribError(message) {
    if (!contribErrorEl) return;
    contribErrorEl.textContent = message;
    contribErrorEl.classList.remove("d-none");
  }

  function clearContribError() {
    if (!contribErrorEl) return;
    contribErrorEl.textContent = "";
    contribErrorEl.classList.add("d-none");
  }

  function renderRepoCard(repo) {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 reveal";

    const card = document.createElement("div");
    card.className = "card-surface hover-lift p-4 h-100 d-flex flex-column";

    const top = document.createElement("div");
    top.className = "d-flex align-items-start justify-content-between gap-3";

    const title = document.createElement("h3");
    title.className = "h6 fw-semibold mb-2";
    title.textContent = repo.name || "Repository";

    const stars = document.createElement("span");
    stars.className = "badge text-bg-light border";
    stars.textContent = `⭐ ${repo.stargazers_count ?? 0}`;

    top.appendChild(title);
    top.appendChild(stars);

    const desc = document.createElement("p");
    desc.className = "text-muted mb-3";
    desc.textContent = repo.description || "No description";

    const bottom = document.createElement("div");
    bottom.className = "d-flex gap-2 flex-wrap mt-auto align-items-center";

    const lang = document.createElement("span");
    lang.className = "badge text-bg-light border";
    lang.textContent = repo.language || "Unknown";
    bottom.appendChild(lang);

    if (repo.archived) {
      const archived = document.createElement("span");
      archived.className = "badge text-bg-light border";
      archived.textContent = "Archived";
      bottom.appendChild(archived);
    }

    const link = document.createElement("a");
    link.className = "btn btn-sm btn-outline-secondary ms-auto";
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View";
    bottom.appendChild(link);

    card.appendChild(top);
    card.appendChild(desc);
    card.appendChild(bottom);
    col.appendChild(card);
    return col;
  }

  function colorFromCount(count) {
    if (count >= 15) return "#216e39";
    if (count >= 10) return "#30a14e";
    if (count >= 5) return "#40c463";
    if (count >= 1) return "#9be9a8";
    return "#ebedf0";
  }

  function normalizeContributions(contributions) {
    const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));
    const weeks = [];
    let currentWeek = new Array(7).fill(null);

    for (const day of sorted) {
      const date = new Date(`${day.date}T00:00:00`);
      const dow = date.getDay(); // 0=Sun ... 6=Sat
      if (dow === 0 && currentWeek.some(Boolean)) {
        weeks.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }
      currentWeek[dow] = day;
    }

    if (currentWeek.some(Boolean)) {
      weeks.push(currentWeek);
    }

    return { weeks, sorted };
  }

  function renderMonths(weeks) {
    if (!contribMonthsEl) return;
    contribMonthsEl.innerHTML = "";

    const monthLabels = [];
    let lastMonth = null;

    weeks.forEach((week, index) => {
      const firstDay = week.find(Boolean);
      if (!firstDay) return;
      const date = new Date(`${firstDay.date}T00:00:00`);
      const month = date.getMonth();
      const monthName = date.toLocaleString("en-US", { month: "short" });

      if (month !== lastMonth) {
        monthLabels.push({ index, label: monthName });
        lastMonth = month;
      }
    });

    for (const item of monthLabels) {
      const label = document.createElement("span");
      label.textContent = item.label;
      label.style.gridColumnStart = String(item.index + 1);
      contribMonthsEl.appendChild(label);
    }

    contribMonthsEl.style.gridTemplateColumns = `repeat(${weeks.length}, minmax(0, 1fr))`;
  }

  function renderContributions(contributions) {
    if (!contribContainer) return;
    contribContainer.innerHTML = "";

    const fragment = document.createDocumentFragment();
    const { weeks } = normalizeContributions(contributions);

    renderMonths(weeks);
    contribContainer.style.gridTemplateColumns = `repeat(${weeks.length}, minmax(0, 1fr))`;

    for (const week of weeks) {
      for (let i = 0; i < 7; i += 1) {
        const day = week[i];
        const cell = document.createElement("div");
        cell.className = "github-contrib-day";
        if (day) {
          cell.style.backgroundColor = day.color || colorFromCount(day.count || 0);
          const count = day.count ?? 0;
          cell.title = `${day.date}: ${count} contribution${count === 1 ? "" : "s"}`;
        }
        fragment.appendChild(cell);
      }
    }

    contribContainer.appendChild(fragment);
  }

  async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) {
      throw new Error(`GitHub request failed (${res.status})`);
    }
    return res.json();
  }

  async function load() {
    clearError();

    try {
      const profile = await fetchJson(`https://api.github.com/users/${encodeURIComponent(username)}`);

      if (nameEl) nameEl.textContent = profile.name || profile.login || username;
      if (bioEl) bioEl.textContent = profile.bio || "";
      if (avatarEl) avatarEl.src = profile.avatar_url || "";

      const profileUrl = profile.html_url || `https://github.com/${username}`;
      if (profileLinkEl) {
        profileLinkEl.href = profileUrl;
        profileLinkEl.target = "_blank";
        profileLinkEl.rel = "noopener noreferrer";
      }

      const repos = await fetchJson(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`
      );

      reposContainer.innerHTML = "";
      for (const repo of repos.filter((r) => !r.fork)) {
        reposContainer.appendChild(renderRepoCard(repo));
      }

      const reveals = Array.from(reposContainer.querySelectorAll(".reveal"));
      for (const el of reveals) el.classList.add("is-visible");

      if (contribContainer) {
        clearContribError();
        try {
          const contribRes = await fetchJson(
            `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`
          );

          if (Array.isArray(contribRes.contributions)) {
            renderContributions(contribRes.contributions);
          }

          const yearLabel =
            contribRes.years && contribRes.years.length
              ? `Last 12 months (${contribRes.years[contribRes.years.length - 1]})`
              : "Last 12 months";

          if (contribYearEl) contribYearEl.textContent = yearLabel;
        } catch (err) {
          try {
            const fallbackRes = await fetchJson(
              `https://github-contributions-api.deno.dev/${encodeURIComponent(username)}`
            );

            if (Array.isArray(fallbackRes.contributions)) {
              renderContributions(fallbackRes.contributions);
            }

            if (contribYearEl) contribYearEl.textContent = "Last 12 months";
          } catch (fallbackErr) {
            showContribError(
              "Unable to load GitHub contributions right now. (Tip: public APIs can have rate limits.)"
            );
          }
        }
      }
    } catch (err) {
      showError(
        "Unable to load GitHub repositories right now. (Tip: GitHub API has rate limits, so try again later.)"
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load, { once: true });
  } else {
    load();
  }
})();
