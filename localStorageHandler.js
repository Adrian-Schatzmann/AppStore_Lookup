/**
 * Speichert eine App im localStorage als Favorit
 * @param {*} favoriteToAdd App ID der App, die in den Favoriten gespeichert werden soll
 */
export function addFavorites(favoriteToAdd) {
  //Bestehendes array holen falls vorhanden
  let currentArray = JSON.parse(localStorage.getItem("favorites")) || [];
  //Doppelte Favoriten filtern
  const newSet = new Set(currentArray); //Erstellt Set aus Array
  newSet.add(favoriteToAdd); //Fügt neuen Wert hinzu
  currentArray = Array.from(newSet); //Zurück zu Array
  //Neues Array im localStorage speichern
  localStorage.setItem("favorites", JSON.stringify(currentArray));
}

/**
 * Entfernt eine als Favorit gespeicherte App aus dem localStorage
 * @param {*} favoriteToRemove App ID der App, die aus den Favoriten entfernt werden soll
 */
export function removeFavorites(favoriteToRemove) {
  console.log("App to be removed from favorites: " + favoriteToRemove);
  //Bestehendes array holen falls vorhanden
  let currentArray = JSON.parse(localStorage.getItem("favorites")) || [];
  //Bestehenden Favorit entfernen
  const filteredArray = currentArray.filter((item) => item != favoriteToRemove);
  //Neues Array im localStorage speichern
  localStorage.setItem("favorites", JSON.stringify(filteredArray));
}

/**
 * Liest gespeicherte Favoriten
 * @returns Bestehendes Favorites Array aus localStorage
 */
export function getFavorites() {
  //Bestehendes array holen falls vorhanden
  return JSON.parse(localStorage.getItem("favorites")) || [];
}
