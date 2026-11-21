import type { ExtractedJob } from "../types";

// This function runs INSIDE the job page, not in the side panel.
// Chrome copies its code into the page, so it can't use imports
// or anything defined outside it. Keep every helper inside.
export function extractJob(): ExtractedJob {
  const meta = (property: string): string =>
    document
      .querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
      ?.content.trim() ?? "";

  const shortDate = (iso?: string): string => {
    if (!iso) return "";
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const host = window.location.hostname;
  const site = host.includes("linkedin")
    ? "LinkedIn"
    : host.includes("greenhouse")
      ? "Greenhouse"
      : host.includes("lever.co")
        ? "Lever"
        : host.includes("myworkdayjobs")
          ? "Workday"
          : host.includes("indeed")
            ? "Indeed"
            : host.replace(/^www\./, "");

  // 1. Structured data (JSON-LD): Greenhouse, Lever and many career pages
  type Place = { address?: { addressLocality?: string } };
  type JsonLdJob = {
    "@type"?: string;
    title?: string;
    description?: string;
    validThrough?: string;
    identifier?: { value?: string } | string;
    hiringOrganization?: { name?: string };
    jobLocation?: Place | Place[];
  };

  const scripts = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  );
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent ?? "");
      const items: JsonLdJob[] = Array.isArray(data)
        ? data
        : (data["@graph"] ?? [data]);
      const job = items.find((item) => item["@type"] === "JobPosting");
      if (!job) continue;

      const place = Array.isArray(job.jobLocation)
        ? job.jobLocation[0]
        : job.jobLocation;
      const id =
        typeof job.identifier === "string"
          ? job.identifier
          : job.identifier?.value;
      // DOMParser turns the HTML description into plain text without running anything in it
      const description =
        new DOMParser().parseFromString(job.description ?? "", "text/html").body
          .textContent ?? "";

      return {
        title: job.title ?? "",
        company: job.hiringOrganization?.name ?? "",
        location: place?.address?.addressLocality ?? "",
        jobId: id ?? "",
        applyBy: shortDate(job.validThrough),
        description: description.trim().slice(0, 5000),
        site,
        url: window.location.href,
      };
    } catch {
      // badly formatted JSON-LD: try the next block
    }
  }

  // 2. LinkedIn. Its class names are scrambled and change often, so this uses
  //    stable hooks instead: the job details panel, links, and visible text.
  //    Tested on linkedin.com/jobs/view/... in Nov 2026.
  if (site === "LinkedIn") {
    const panel =
      document.querySelector<HTMLElement>('[data-sdui-screen*="JobDetails"]') ??
      document.body;

    const params = new URLSearchParams(window.location.search);
    const jobId =
      params.get("currentJobId") ??
      window.location.pathname.match(/\/jobs\/view\/(\d+)/)?.[1] ??
      "";

    // title: the link to the job itself.
    // Backup on single-job pages: the tab title, "Title | Company | LinkedIn"
    // (a leading "(3) " notification count is removed).
    const onJobPage = window.location.pathname.startsWith("/jobs/view/");
    const title =
      panel
        .querySelector<HTMLElement>('a[href*="/jobs/view/"]')
        ?.innerText.trim() ||
      (onJobPage
        ? document.title
            .replace(/^\(\d+\)\s*/, "")
            .split("|")[0]
            .trim()
        : "");

    // company: the link to the company's LinkedIn page
    const company =
      panel
        .querySelector<HTMLElement>('a[href*="/company/"]')
        ?.innerText.trim() ?? "";

    // location: the first line with " · ", e.g. "Toronto, ON · Reposted 6 days ago · ..."
    const detailsLine =
      Array.from(panel.querySelectorAll<HTMLElement>("p, span"))
        .map((el) => el.innerText.trim())
        .find((text) => text.includes(" · ")) ?? "";

    // description: find the "About the job" heading, then climb up
    // until we reach the block that holds the whole description
    let about: HTMLElement | null =
      Array.from(panel.querySelectorAll<HTMLElement>("h2, h3, p, span")).find(
        (el) => el.innerText.trim() === "About the job",
      ) ?? null;
    while (about && about.innerText.trim().length < 200)
      about = about.parentElement;
    const description =
      about?.innerText.replace(/^About the job\s*/, "").trim() ?? "";

    return {
      title,
      company,
      location: detailsLine.split("·")[0].trim(), // -> "Toronto, ON"
      jobId,
      applyBy: "",
      description: description.slice(0, 5000),
      site,
      // the search page URL is the same for every job, so build a stable link per job
      url: jobId
        ? `https://www.linkedin.com/jobs/view/${jobId}/`
        : window.location.href,
    };
  }

  // 3. MyGreenhouse (my.greenhouse.io): the job opens in a pop-up with no
  //    structured data. The Apply link points to the real posting, e.g.
  //    https://job-boards.greenhouse.io/stackadapt/jobs/4509177009
  //    Tested in Nov 2026.
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
  if (site === "Greenhouse" && dialog) {
    const titleEl = dialog.querySelector<HTMLElement>("h1, h2");
    const title = titleEl?.innerText.trim() ?? "";

    // job ID and company name from the Apply link
    const applyLink = Array.from(
      dialog.querySelectorAll<HTMLAnchorElement>("a"),
    ).find((a) => /greenhouse\.io\/[^/]+\/jobs\/\d+/.test(a.href));
    const match = applyLink?.href.match(/greenhouse\.io\/([^/]+)\/jobs\/(\d+)/);
    const slug = match?.[1] ?? ""; // "stackadapt"
    const jobId = match?.[2] ?? ""; // "4509177009"

    // company: the line right under the title.
    // Climb up from the title until the block has more than one line of text.
    let header: HTMLElement | null = titleEl;
    while (
      header &&
      header !== dialog &&
      header.innerText.trim().split("\n").filter(Boolean).length < 2
    ) {
      header = header.parentElement;
    }
    const headerLines = (header?.innerText ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !/^(apply|create job alert)$/i.test(line));
    const titleIndex = headerLines.indexOf(title);
    const company =
      (titleIndex >= 0 ? headerLines[titleIndex + 1] : "") ||
      // backup: "stackadapt" -> "Stackadapt"
      slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    // location: tags like "Toronto, ON" and "Remote"
    const shortTexts = Array.from(
      dialog.querySelectorAll<HTMLElement>("span, li, p"),
    )
      .map((el) => el.innerText.trim())
      .filter((text) => text && text.length < 40);
    const city = shortTexts.find((text) =>
      /^[A-Za-zÀ-ÿ .'-]+, [A-Z]{2}$/.test(text),
    );
    const remote = shortTexts.some((text) => /^remote$/i.test(text));
    const place = city
      ? remote
        ? `${city} (Remote)`
        : city
      : remote
        ? "Remote"
        : "";

    // description: the pop-up's paragraphs and bullet points
    const description = Array.from(
      dialog.querySelectorAll<HTMLElement>("p, li"),
    )
      .filter((el) => !(el.tagName === "LI" && el.querySelector("p"))) // avoid counting text twice
      .map((el) => el.innerText.trim())
      .filter((text) => text.length > 40)
      .join("\n\n");

    return {
      title,
      company,
      location: place,
      jobId,
      applyBy: "",
      description: description.slice(0, 5000),
      site,
      url: applyLink?.href ?? window.location.href,
    };
  }

  // 4. Workday (*.myworkdayjobs.com): no structured data. The page address ends
  //    with the job ID (..._JR-0111215-1), and the job list has a card per job
  //    with labelled parts (data-automation-id). We read the card whose ID
  //    matches the address. Tested Nov 2026.
  if (site === "Workday") {
    const jobId = window.location.pathname.match(/_([A-Z]+-?\d+)/)?.[1] ?? ""; // "JR-0111215"

    // find the card whose ID label matches, then climb up to the whole card
    const idLabel = Array.from(
      document.querySelectorAll<HTMLElement>('[data-automation-id="subtitle"]'),
    ).find((el) => el.innerText.trim() === jobId);
    let card: HTMLElement | null = idLabel ?? null;
    while (card && !card.querySelector('[data-automation-id="jobTitle"]'))
      card = card.parentElement;

    // reads one labelled part of the card, dropping its label line
    // e.g. "locations\nUSA, CA, Pleasanton" -> "USA, CA, Pleasanton"
    const part = (id: string): string => {
      const text =
        card
          ?.querySelector<HTMLElement>(`[data-automation-id="${id}"]`)
          ?.innerText.trim() ?? "";
      return text.split("\n").pop()?.trim() ?? "";
    };

    // title backup from the address:
    // "Software-Development-Engineer---Authentication-Security_JR-0111215-1"
    // -> "Software Development Engineer – Authentication Security"
    const slugTitle = (window.location.pathname.split("/").pop() ?? "")
      .split("_")[0]
      .replace(/---/g, " – ")
      .replace(/-/g, " ");

    // company: first part of the address, "workday" in workday.wd5.myworkdayjobs.com
    const tenant = host.split(".")[0];

    return {
      title: part("jobTitle") || slugTitle,
      company: tenant.charAt(0).toUpperCase() + tenant.slice(1),
      location: part("locations"),
      jobId,
      applyBy: "",
      // not labelled on the pages tested yet; paste it in for now
      description:
        document
          .querySelector<HTMLElement>(
            '[data-automation-id="jobPostingDescription"]',
          )
          ?.innerText.trim()
          .slice(0, 5000) ?? "",
      site,
      url: window.location.origin + window.location.pathname,
    };
  }

  // 5. Indeed: the job opens in a panel on the right, and Indeed labels its
  //    parts with data-testid. Tested Nov 2026.
  if (site === "Indeed") {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("vjk") ?? params.get("jk") ?? ""; // e.g. "a2e0d43d8c4f6371"

    // title: first line only, without the hidden " - job post" screen-reader text
    const titleEl = document.querySelector<HTMLElement>(
      '[data-testid="vj-job-title"], [data-testid*="JobInfoHeader-title"]',
    );
    const title = (titleEl?.innerText ?? "")
      .split("\n")[0]
      .replace(/\s*-\s*job post$/i, "")
      .trim();

    // company + location: climb up from the title until we reach the part of the
    // right panel that has a company name (so we don't read the cards on the left)
    let panel: HTMLElement | null = titleEl;
    while (panel && !panel.querySelector('[data-testid="company-name"]'))
      panel = panel.parentElement;
    const inPanel = (id: string): string =>
      (
        panel?.querySelector<HTMLElement>(`[data-testid="${id}"]`)?.innerText ??
        ""
      )
        .split("\n")[0]
        .trim();

    // description: the block that holds "Full job description", minus its
    // heading and any styling code Indeed puts inside it
    let descBox: HTMLElement | null =
      document.querySelector<HTMLElement>("#jobDescriptionText") ??
      document.querySelector<HTMLElement>(
        '[data-testid*="jobDescriptionTitleSeen"]',
      );
    while (descBox && descBox.innerText.trim().length < 300)
      descBox = descBox.parentElement;
    let description = descBox?.innerText ?? "";
    for (const style of Array.from(
      descBox?.querySelectorAll<HTMLElement>("style") ?? [],
    )) {
      description = description.replace(style.innerText, "");
    }
    description = description
      .replace(/^\s*Full job description\s*/i, "")
      .trim();

    return {
      title,
      company: inPanel("company-name"),
      location: inPanel("text-location"),
      jobId,
      applyBy: "",
      description: description.slice(0, 5000),
      site,
      // the search page address changes with filters, so build a stable link per job
      url: jobId
        ? `${window.location.origin}/viewjob?jk=${jobId}`
        : window.location.href,
    };
  }

  // 6. Anything else: best guess from the page heading and meta tags
  return {
    title:
      document.querySelector<HTMLElement>("h1")?.innerText.trim() ||
      meta("og:title"),
    company: meta("og:site_name"),
    location: "",
    jobId: "",
    applyBy: "",
    description: meta("og:description"),
    site,
    url: window.location.href,
  };
}

// Runs in the side panel: asks Chrome to run extractJob on the current tab.
export async function readCurrentJob(): Promise<ExtractedJob | null> {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return null;
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractJob,
    });
    return injection?.result ?? null;
  } catch {
    // e.g. chrome:// pages, or a site Haku isn't allowed to read
    return null;
  }
}
