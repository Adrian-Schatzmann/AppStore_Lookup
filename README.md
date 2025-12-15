# 🍏 AppStore Search & CVE Lookup Tool

A modern web tool that combines the **Apple iTunes Search & Lookup API** and the **NIST NVD API** to provide detailed information about apps and current security vulnerabilities (CVEs).

**[👉 Try it here](https://adrian-schatzmann.github.io/AppStore_Lookup/)**

## ✨ Features

### 1. App Store Search

* **iOS & macOS:** Finds apps across platforms through parallel queries.
* **Smart Filters:** Filter by developer or specific platforms (macOS, iOS, watchOS, etc.).
* **Details:** Displays bundle ID, app ID, version, category, and more.
* **Favorites:** Stores important apps locally in the browser (`localStorage`).

### 2. Security Dashboard (CVE)

* **Real-time Data:** Displays the latest **critical security vulnerabilities** (CRITICAL severity) from the last 24 hours.
* **Responsive:** Optimized display for mobile and desktop.

## 🔌 APIs Used

| API                         | Purpose           | Special Feature                                                                       |
| --------------------------- | ----------------- | ------------------------------------------------------------------------------------- |
| **Apple iTunes Search API** | Search app data   | Uses `jsonp` to bypass CORS and the `entity` parameter for separate Mac/iOS searches. |
| **Apple iTunes Lookup API** | Load app details  | Retrieves specific metadata based on the app ID.                                      |
| **NIST NVD API 2.0**        | Retrieve CVE data | Filters by `cvssV31Severity=CRITICAL` and time window.                                |

## 🛠️ Technologies & Dependencies

* **Frontend:** HTML5, CSS3, JavaScript
* **Framework:** [Bootstrap 5.3](https://getbootstrap.com/) (Styling & responsive layout)
* **Library:** [jQuery 3.7.1](https://jquery.com/) (DOM manipulation & AJAX)
* **Security:** [DOMPurify](https://github.com/cure53/DOMPurify) (XSS protection when rendering HTML)
* **Icons:** Inline SVGs (No external icon fonts required)

## 🚀 Installation

No build tools required. The project runs directly in the browser.



#🍏 AppStore Search & CVE Lookup ToolEin modernes Web-Tool, das die **Apple iTunes Search & Lookup API** und die **NIST NVD API** kombiniert, um detaillierte Informationen zu Apps und aktuellen Sicherheitslücken (CVEs) zu liefern.

**[👉 Hier ausprobieren](https://adrian-schatzmann.github.io/AppStore_Lookup/)**

##✨ Features###1. App Store Suche* **iOS & macOS:** Findet Apps plattformübergreifend durch parallele Abfragen.
* **Smarte Filter:** Filtern nach Entwickler oder spezifischen Plattformen (macOS, iOS, watchOS, etc.).
* **Details:** Zeigt Bundle-ID, App-ID, Version, Kategorie und mehr.
* **Favoriten:** Speichert wichtige Apps lokal im Browser (`localStorage`).

###2. Security Dashboard (CVE)* **Echtzeit-Daten:** Zeigt die neuesten **kritischen Sicherheitslücken** (CRITICAL Severity) der letzten 24 Stunden.
* **Responsive:** Optimierte Darstellung für Mobile und Desktop.

##🔌 Verwendete APIs| API | Zweck | Besonderheit |
| --- | --- | --- |
| **Apple iTunes Search API** | App-Daten suchen | Nutzt `jsonp` zur Umgehung von CORS und `entity`-Parameter für getrennte Mac/iOS-Suchen. |
| **Apple iTunes Lookup API** | App-Details laden | Ruft spezifische Metadaten basierend auf der App-ID ab. |
| **NIST NVD API 2.0** | CVE-Daten abrufen | Filtert nach `cvssV31Severity=CRITICAL` und Zeitfenster. |

##🛠️ Technologien & Dependencies* **Frontend:** HTML5, CSS3, JavaScript
* **Framework:** [Bootstrap 5.3](https://getbootstrap.com/) (Styling & Responsive Layout)
* **Library:** [jQuery 3.7.1](https://jquery.com/) (DOM-Manipulation & AJAX)
* **Security:** [DOMPurify](https://github.com/cure53/DOMPurify) (XSS-Schutz beim Rendern von HTML)
* **Icons:** Inline SVGs (Keine externen Icon-Fonts nötig)

##🚀 InstallationKeine Build-Tools erforderlich. Das Projekt läuft direkt im Browser.