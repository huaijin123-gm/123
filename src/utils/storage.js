const FAVORITES_KEY = "time-museum-favorites";
const MUSEUM_CONTENT_KEY = "time-museum-content";

export function readFavorites() {
  try {
    const value = localStorage.getItem(FAVORITES_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function readMuseumContent(defaultContent) {
  try {
    const value = localStorage.getItem(MUSEUM_CONTENT_KEY);
    return value ? JSON.parse(value) : defaultContent;
  } catch {
    return defaultContent;
  }
}

export function saveMuseumContent(content) {
  localStorage.setItem(MUSEUM_CONTENT_KEY, JSON.stringify(content));
}

export function clearMuseumContent() {
  localStorage.removeItem(MUSEUM_CONTENT_KEY);
}
