const defaultProfile = {
  displayName: "Tantris235",
  bioPl: "Siema lubię programować i grać w gry. Na tej stronie znajdziesz informacje o mnie",
  bioEn: "Hey, I like programming and playing games. On this page you'll find information about me.",
  youtube: {
    label: "Tantris235",
    url: "https://www.youtube.com/@Tantris235",
    handle: "Tantris235",
    subscribersFallback: 0
  },
  discord: {
    labelPl: "Mój serwer Discord",
    labelEn: "My Discord server",
    url: "https://discord.gg/"
  },
  minecraft: {
    label: "Tantris_YT",
    url: "https://namemc.com/profile/Tantris_YT"
  },
  roblox: {
    label: "Tantris235",
    url: "https://www.roblox.com/pl/users/5764999872/profile"
  }
};

const savedProfile = (() => {
  try {
    const raw = localStorage.getItem("adminProfile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const profile = {
  ...defaultProfile,
  ...savedProfile,
  youtube: {
    ...defaultProfile.youtube,
    ...(savedProfile?.youtube || {})
  },
  discord: {
    ...defaultProfile.discord,
    ...(savedProfile?.discord || {})
  },
  minecraft: {
    ...defaultProfile.minecraft,
    ...(savedProfile?.minecraft || {})
  },
  roblox: {
    ...defaultProfile.roblox,
    ...(savedProfile?.roblox || {})
  }
};

const translations = {
  pl: {
    pageTitle: "Mój profil",
    lang: "pl",
    bio: profile.bioPl,
    discordButton: "Wkrótce...",
    subscriberLabel: "Suby",
    subscriberText: "YouTube na żywo",
    subscriberGain: "+1",
    youtubeText: "Mój kanał na YT",
    discordName: profile.discord.labelPl,
    discordText: "Już wkrótce",
    minecraftText: "Mój nick w Minecraft",
    robloxText: "Mój profil na Roblox"
  },
  en: {
    pageTitle: "My Bio",
    lang: "en",
    bio: profile.bioEn,
    discordButton: "Coming soon...",
    subscriberLabel: "Subs",
    subscriberText: "Live from YouTube",
    subscriberGain: "+1",
    youtubeText: "My YouTube channel",
    discordName: profile.discord.labelEn,
    discordText: "Coming soon",
    minecraftText: "My Minecraft nickname",
    robloxText: "My Roblox profile"
  }
};

const langPlButton = document.getElementById("langPl");
const langEnButton = document.getElementById("langEn");
const subscriberLabel = document.getElementById("subscriberLabel");
const subscriberText = document.getElementById("subscriberText");
const subscriberBadge = document.getElementById("subscriberBadge");
const subscriberCounter = document.getElementById("subscriberCounter");
const adminPanel = document.getElementById("adminPanel");
const adminClose = document.getElementById("adminClose");
const adminForm = document.getElementById("adminForm");
const adminReset = document.getElementById("adminReset");
const normalizedPath = window.location.pathname.replace(/\\/g, "/").toLowerCase();
const isAdminPage =
  normalizedPath.endsWith("/admin") ||
  normalizedPath.endsWith("/admin/") ||
  normalizedPath.endsWith("/admin/index.html") ||
  normalizedPath.endsWith("/temp") ||
  normalizedPath.endsWith("/temp/") ||
  normalizedPath.endsWith("/temp/index.html");

function getRelativePath(fileName) {
  return isAdminPage ? `../${fileName}` : fileName;
}

let currentSubscribers = profile.youtube.subscribersFallback;
let activeLanguage = "pl";

function formatSubscriberNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function renderSubscriberNumber(value) {
  subscriberCounter.innerHTML = "";

  formatSubscriberNumber(value).split("").forEach((character) => {
    if (/\d/.test(character)) {
      const slot = document.createElement("span");
      slot.className = "digit-slot";

      const track = document.createElement("span");
      track.className = "digit-track";
      track.dataset.current = character;

      const digit = document.createElement("span");
      digit.className = "digit";
      digit.textContent = character;

      track.appendChild(digit);
      slot.appendChild(track);
      subscriberCounter.appendChild(slot);
      return;
    }

    const separator = document.createElement("span");
    separator.className = "digit-separator";
    separator.textContent = character;
    subscriberCounter.appendChild(separator);
  });
}

function animateSubscriberCount(nextValue) {
  if (nextValue === currentSubscribers) {
    return;
  }

  const nextFormatted = formatSubscriberNumber(nextValue);
  const slots = subscriberCounter.querySelectorAll(".digit-slot");
  const digits = nextFormatted.split("").filter((character) => /\d/.test(character));

  let digitIndex = 0;

  slots.forEach((slot) => {
    const track = slot.querySelector(".digit-track");
    const nextDigit = digits[digitIndex];
    digitIndex += 1;

    if (!track || track.dataset.current === nextDigit) {
      return;
    }

    const currentDigitNode = track.lastElementChild?.cloneNode(true);
    const nextDigitNode = document.createElement("span");
    nextDigitNode.className = "digit";
    nextDigitNode.textContent = nextDigit;

    track.innerHTML = "";
    if (currentDigitNode) {
      track.appendChild(currentDigitNode);
    }
    track.appendChild(nextDigitNode);
    track.classList.add("is-animating");
    track.style.transform = "translateY(0)";

    requestAnimationFrame(() => {
      track.style.transform = "translateY(-50%)";
    });

    window.setTimeout(() => {
      track.classList.remove("is-animating");
      track.innerHTML = "";
      track.appendChild(nextDigitNode);
      track.style.transform = "translateY(0)";
      track.dataset.current = nextDigit;
    }, 680);
  });

  subscriberBadge.classList.remove("is-visible");
  void subscriberBadge.offsetWidth;
  subscriberBadge.classList.add("is-visible");
  currentSubscribers = nextValue;
}

async function loadSubscriberCount() {
  try {
    const subsUrl = new URL(getRelativePath("subs.json"), window.location.href);
    subsUrl.searchParams.set("t", Date.now().toString());

    const response = await fetch(subsUrl.toString(), {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (typeof data.subscribers !== "number") {
      throw new Error("Invalid subscriber response");
    }

    if (!subscriberCounter.children.length) {
      currentSubscribers = data.subscribers;
      renderSubscriberNumber(currentSubscribers);
      return;
    }

    animateSubscriberCount(data.subscribers);
  } catch (error) {
    if (!subscriberCounter.children.length) {
      renderSubscriberNumber(currentSubscribers);
    }

    console.warn("Could not load YouTube subscribers.", error);
  }
}

function applyLanguage(language) {
  activeLanguage = language;
  const text = translations[language];

  document.documentElement.lang = text.lang;
  document.title = text.pageTitle;
  document.getElementById("bio").textContent = language === "pl" ? profile.bioPl : profile.bioEn;
  document.getElementById("discordLink").textContent = text.discordButton;
  subscriberLabel.textContent = text.subscriberLabel;
  subscriberText.textContent = text.subscriberText;
  subscriberBadge.textContent = text.subscriberGain;
  document.getElementById("discordName").textContent =
    language === "pl" ? profile.discord.labelPl : profile.discord.labelEn;
  document.getElementById("textYoutube").textContent = text.youtubeText;
  document.getElementById("textDiscord").textContent = text.discordText;
  document.getElementById("textMinecraft").textContent = text.minecraftText;
  document.getElementById("textRoblox").textContent = text.robloxText;

  langPlButton.classList.toggle("is-active", language === "pl");
  langEnButton.classList.toggle("is-active", language === "en");

  try {
    localStorage.setItem("preferredLanguage", language);
  } catch {
    // Ignore storage issues and keep the page working.
  }
}

function applyProfileData() {
  document.getElementById("displayName").textContent = profile.displayName;
  document.getElementById("youtubeName").textContent = profile.youtube.label;
  document.getElementById("discordLink").href = profile.discord.url;
  document.getElementById("minecraftNick").textContent = profile.minecraft.label;
  document.getElementById("robloxNick").textContent = profile.roblox.label;
  document.getElementById("cardYoutube").href = profile.youtube.url;
  document.getElementById("cardDiscord").href = profile.discord.url;
  document.getElementById("cardMinecraft").href = profile.minecraft.url;
  document.getElementById("cardRoblox").href = profile.roblox.url;
  applyLanguage(activeLanguage);
}

function fillAdminForm() {
  if (!adminForm) {
    return;
  }

  document.getElementById("adminDisplayName").value = profile.displayName;
  document.getElementById("adminBioPl").value = profile.bioPl;
  document.getElementById("adminBioEn").value = profile.bioEn;
  document.getElementById("adminYoutubeLabel").value = profile.youtube.label;
  document.getElementById("adminYoutubeUrl").value = profile.youtube.url;
  document.getElementById("adminDiscordLabelPl").value = profile.discord.labelPl;
  document.getElementById("adminDiscordLabelEn").value = profile.discord.labelEn;
  document.getElementById("adminDiscordUrl").value = profile.discord.url;
  document.getElementById("adminMinecraftLabel").value = profile.minecraft.label;
  document.getElementById("adminMinecraftUrl").value = profile.minecraft.url;
  document.getElementById("adminRobloxLabel").value = profile.roblox.label;
  document.getElementById("adminRobloxUrl").value = profile.roblox.url;
}

function saveProfile() {
  try {
    localStorage.setItem("adminProfile", JSON.stringify(profile));
  } catch {
    console.warn("Could not save admin profile.");
  }
}

function setAdminPanel(open) {
  if (!adminPanel) {
    return;
  }

  adminPanel.classList.toggle("is-open", open);
  adminPanel.setAttribute("aria-hidden", String(!open));
}

const savedLanguage = (() => {
  try {
    return localStorage.getItem("preferredLanguage");
  } catch {
    return null;
  }
})();

const currentLanguage =
  savedLanguage ||
  (navigator.language?.toLowerCase().startsWith("pl") ? "pl" : "en");

renderSubscriberNumber(currentSubscribers);
applyProfileData();
fillAdminForm();
applyLanguage(currentLanguage);
loadSubscriberCount();

langPlButton.addEventListener("click", () => applyLanguage("pl"));
langEnButton.addEventListener("click", () => applyLanguage("en"));
window.setInterval(loadSubscriberCount, 60000);

if (isAdminPage) {
  setAdminPanel(true);
}

if (adminClose) {
  adminClose.addEventListener("click", () => {
    setAdminPanel(false);
  });
}

if (adminForm) {
  adminForm.addEventListener("submit", (event) => {
    event.preventDefault();

    profile.displayName = document.getElementById("adminDisplayName").value.trim() || defaultProfile.displayName;
    profile.bioPl = document.getElementById("adminBioPl").value.trim() || defaultProfile.bioPl;
    profile.bioEn = document.getElementById("adminBioEn").value.trim() || defaultProfile.bioEn;
    profile.youtube.label = document.getElementById("adminYoutubeLabel").value.trim() || defaultProfile.youtube.label;
    profile.youtube.url = document.getElementById("adminYoutubeUrl").value.trim() || defaultProfile.youtube.url;
    profile.discord.labelPl =
      document.getElementById("adminDiscordLabelPl").value.trim() || defaultProfile.discord.labelPl;
    profile.discord.labelEn =
      document.getElementById("adminDiscordLabelEn").value.trim() || defaultProfile.discord.labelEn;
    profile.discord.url = document.getElementById("adminDiscordUrl").value.trim() || defaultProfile.discord.url;
    profile.minecraft.label =
      document.getElementById("adminMinecraftLabel").value.trim() || defaultProfile.minecraft.label;
    profile.minecraft.url = document.getElementById("adminMinecraftUrl").value.trim() || defaultProfile.minecraft.url;
    profile.roblox.label = document.getElementById("adminRobloxLabel").value.trim() || defaultProfile.roblox.label;
    profile.roblox.url = document.getElementById("adminRobloxUrl").value.trim() || defaultProfile.roblox.url;

    saveProfile();
    applyProfileData();
    fillAdminForm();
  });
}

if (adminReset) {
  adminReset.addEventListener("click", () => {
    Object.assign(profile, {
      ...defaultProfile,
      youtube: { ...defaultProfile.youtube },
      discord: { ...defaultProfile.discord },
      minecraft: { ...defaultProfile.minecraft },
      roblox: { ...defaultProfile.roblox }
    });

    try {
      localStorage.removeItem("adminProfile");
    } catch {
      console.warn("Could not reset admin profile.");
    }

    fillAdminForm();
    applyProfileData();
  });
}

const tiltCards = document.querySelectorAll(".tilt-card");

document.addEventListener("pointermove", (event) => {
  const x = (event.clientX / window.innerWidth - 0.5) * 8;
  const y = (event.clientY / window.innerHeight - 0.5) * 8;

  tiltCards.forEach((card, index) => {
    const depth = index === 0 ? 1 : 0.7;
    card.style.transform = `perspective(1200px) rotateX(${-y * 0.28 * depth}deg) rotateY(${x * 0.28 * depth}deg)`;
  });
});

window.addEventListener("blur", () => {
  tiltCards.forEach((card) => {
    card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  });
});

document.body.addEventListener("pointerleave", () => {
  tiltCards.forEach((card) => {
    card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  });
});
