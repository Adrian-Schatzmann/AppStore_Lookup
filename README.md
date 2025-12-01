🍏 App Store Lookup and Filter Tool

This is a modern, client-side web application designed to efficiently search, retrieve, and analyze app data from the Apple iTunes Search/lookup API. It addresses key limitations of the standard Appstore by adding platform- and developer filtes and showing information like bundle IDs.

✨ Core Functionality

The primary goal of this tool is to provide a unified search experience that reliably includes results from the iOS, macOS, tvOS, and watchOS ecosystems.

1. Robust Data Retrieval (Multisearch)

The application implements a parallel multisearch strategy in main.js:

When a user submits a query, the application sends multiple simultaneous API requests using different entity parameters (entity=software, entity=macSoftware, etc.).

All responses are collected, combined, and filtered before being presented to the user.

2. Specialized Filtering and Sorting

The tool incorporates specific logic to normalize and organize the retrieved data:

Accurate Platform Identification: The filter.js module contains logic (getPlatforms) that analyzes multiple fields (kind, supportedDevices...) within the API response to determine all supported platforms (e.g., distinguishing between iOS and dedicated watchOS apps).

Relevance Sorting: Search results are organized using a tiered algorithm to prioritize the most relevant apps:

Exact name matches.

Names starting with the search term.

Names containing the search term.

Highest user rating count (popularity).

Fallback: sort alphabetically

Platform Filtering: Users can refine the displayed list using a filter dropdown to show only apps available on a selected platform (e.g., only "tvOS" and "macOS" apps).

🛠️ Project Architecture

The application adheres to a clean, modular structure, dividing responsibilities into three distinct JavaScript files:

Module

Responsibility

Description

main.js

Core Control & API

Manages user input (debounce), executes the Multisearch API calls, handles result combination, and orchestrates data flow between the other modules.

ui.js

User Interface Rendering

Handles the dynamic rendering of search suggestions and the final app list display. It integrates the platform icons and manages the visual feedback and error messages.

filter.js

Data Logic & Cleanup

Contains algorithms for data manipulation, including the getPlatforms logic and the advanced sortAppsByRelevance function.

🛡️ Implementation Safeguards

All information (like favorites or last searched) are stored in localstorage on the client.