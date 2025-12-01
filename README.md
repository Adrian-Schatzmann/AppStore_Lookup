This project is an App Store Lookup and Filter Tool designed to retrieve and display app data from the Apple iTunes Search API.
Key Features

    Multisearch: Executes parallel API requests (for iOS, macOS, and artists) to ensure reliable discovery of apps across all platforms.
    Robust Filtering: Uses specialized logic (filter.js) for accurate platform identification.
    Relevance Sorting: Results are tiered by exact name match, starting match, inclusion, and then popularity.
    Modular Architecture: Code is separated into multiple files: main.js (API & Logic), ui.js (Rendering & Icons), and filter.js (Data Cleanup & Sorting).
