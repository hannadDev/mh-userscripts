// ==UserScript==
// @name         MH - Journal Log Tracker
// @version      0.6
// @description  Tracks when your journal log is going to show up next and shows a button to access your last journal log
// @author       hannadDev
// @namespace    https://greasyfork.org/en/users/1238393-hannaddev
// @match        https://www.mousehuntgame.com/*
// @icon         https://www.mousehuntgame.com/images/ui/journal/themes/classic_thumb.gif
// @require      https://cdn.jsdelivr.net/npm/mh-assets@1.0.4/scripts/utils.js
// @require      https://cdn.jsdelivr.net/npm/mousehunt-utils@1.10.5/mousehunt-utils.js
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // #region Variables
    let isDebug = false;

    const localStorageKey = `mh-journal-log-tracker`;

    let storedData = {};
    //#endregion

    //#region Loading external assets
    const mainStylesheetUrl = "https://cdn.jsdelivr.net/npm/mh-assets@1.0.4/stylesheets/main.css";
    const scriptSpecificStylesheetUrl = "https://cdn.jsdelivr.net/npm/mh-assets@1.0.4/stylesheets/journal-log-tracker.css";

    hd_utils.addStyleElement(mainStylesheetUrl);
    hd_utils.addStyleElement(scriptSpecificStylesheetUrl);
    //#endregion

    //#region Initialization
    const observer = new MutationObserver(function (mutations) {
        if (isDebug) {
            console.log('Mutated');
            for (const mutation of mutations) {
                console.log({ mutation });
                console.log(mutation.target);
            }
        }

        // Only save if something was added.
        if (mutations.some(v => v.type === 'childList' && v.addedNodes.length > 0 && v.target.className !== 'journaldate')) {
            tryToScrapeJournal();
        }
    });

    function activateMutationObserver() {
        let observerTarget = document.querySelector(`#journalContainer[data-owner="${user.user_id}"] .content`);

        if (observerTarget !== null && observerTarget !== undefined) {
            observer.observe(observerTarget, {
                childList: true,
                subtree: true
            });
        }
    }

    function Initialize() {
        if (isDebug) console.log(`Initializing.`);

        storedData = getStoredData();

        activateMutationObserver();
        showButton();

        // #region Listeners
        onPageChange({
            camp: {
                show: () => {
                    showButton();
                    activateMutationObserver();
                }
            }
        });

        onRequest(() => { tryToScrapeJournal(); }, 'managers/ajax/turns/activeturn.php');
        //#endregion
    }

    Initialize();
    //#endregion

    // #region LocalStorage Methods
    function getStoredData() {
        const savedData = localStorage.getItem(localStorageKey);

        if (savedData !== null) {
            return JSON.parse(savedData);
        }

        return {
            logs: {},
            lastSavedEntryId: -1
        };
    }

    function setData(stats) {
        localStorage.setItem(localStorageKey, JSON.stringify(stats));
    }
    // #endregion

    // #region Journal Scraping Methods
    function tryToScrapeJournal() {
        if (!isOwnJournal()) {
            return;
        }

        scrapeJournal();
    }

    function scrapeJournal() {
        const entries = document.querySelectorAll('.entry');

        let addedNewEntries = false;
        for (const entry of entries) {
            const entryId = entry.dataset.entryId

            if (!entryId) return;

            if (entry.className.search(/(log_summary)/) !== -1) {
                if (storedData.logs.hasOwnProperty(entryId)) {
                    if (isDebug) console.log(`Entry ${entryId} already stored`);
                }
                else {
                    if (isDebug) console.log(`New entry ${entryId}`);
                    const entryInfo = extractInfoFromEntry(entry);

                    if (entryInfo != null) {
                        storedData.logs[entryId] = entryInfo;

                        if (storedData.lastSavedEntryId < entryId) {
                            storedData.lastSavedEntryId = entryId;
                        }

                        addedNewEntries = true;
                    }
                }
            }
        }

        if (addedNewEntries) {
            setData(storedData);
            showButton();
        }
    }

    function extractInfoFromEntry(entry) {
        const entryInfo = {};

        const splitStringDate = entry.querySelector(".journaldate").innerHTML.split("-")[0].trim().split(" ");

        try {
            const date = new Date();
            date.setMilliseconds(0);
            date.setSeconds(0);

            date.setHours(splitStringDate[0].split(":")[0]);
            date.setMinutes(splitStringDate[0].split(":")[1]);

            if (date.getHours() !== 12 && splitStringDate[1] === "pm") {
                date.setHours(date.getHours() + 12);
            } else if (date.getHours() === 12 && splitStringDate[1] === "am") {
                date.setHours(date.getHours() - 12);
            }

            if (date.getTime() > Date.now()) {
                date.setDate(date.getDate() - 1);
            }

            entryInfo.Timestamp = date.getTime();
        } catch (e) {
            console.log(e);
            return null;
        }

        entryInfo.Duration = entry.querySelector(".reportSubtitle").innerHTML.replace("Last ", "");

        const tableBody = entry.querySelector(".journalbody .journaltext table tbody");
        const tdElements = tableBody.querySelectorAll(".leftSide, .rightSide");
        for (let i = 0; i < tdElements.length; ++i) {
            if (tdElements[i].innerHTML.includes("Catches:")) {
                entryInfo.Catches = Number.parseInt(tdElements[i].nextSibling.innerHTML);
            } else if (tdElements[i].innerHTML.includes("Misses:")) {
                entryInfo.Ftc = Number.parseInt(tdElements[i].nextSibling.innerHTML);
            } else if (tdElements[i].innerHTML.includes("Fail to Attract:")) {
                entryInfo.Fta = Number.parseInt(tdElements[i].nextSibling.innerHTML);
            }
        }

        const link = tableBody.querySelector("a");

        entryInfo.OpenSummaryMethod = link.onclick.toString().split("onclick(event) {")[1].split("return false;")[0].trim();

        return entryInfo;
    }
    // #endregion

    function showButton() {
        if (!isOwnJournal()) {
            return;
        }

        const olderButton = document.querySelector("#journal-log-button");
        if(olderButton) {
            olderButton.remove();
        }

        const target = document.querySelector("#journalContainer .top");
        if (target) {
            const link = document.createElement("a");
            link.id = "journal-log-button";

            link.innerText = `Next Log: ${getNextLogTimer()}`;
            link.href = "#";
            link.classList.add("hd-journal-log-button");
            link.addEventListener("click", function () {
                showLogs();
            });
            target.append(link);
        }
    }

    function showLogs() {
        document.querySelectorAll("#journal-logs-popup-div").forEach(el => el.remove());

        const journalLogsPopup = document.createElement("div");
        journalLogsPopup.id = ("journal-logs-popup-div");
        journalLogsPopup.classList.add("hd-popup");

        // Journal Logs Division
        const journalLogs = document.createElement("div");

        // Title
        const title = document.createElement("h2");
        title.innerText = `Journal Log Tracker`
        title.classList.add("hd-bold");
        journalLogs.appendChild(title);

        // Subtitle
        let nextLogDateString = "N/A";
        if (storedData.lastSavedEntryId !== undefined && storedData.logs[storedData.lastSavedEntryId] !== undefined) {
            const logDate = new Date(storedData.logs[storedData.lastSavedEntryId].Timestamp);
            logDate.setHours(logDate.getHours() + 36);

            nextLogDateString = `${logDate.toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - (${getNextLogTimer()})`;
        }

        const subtitle = document.createElement("h4");
        subtitle.innerText = `Next Estimated Log: ${nextLogDateString}`;
        journalLogs.appendChild(subtitle);

        journalLogs.appendChild(document.createElement("br"));

        // Table for journal logs
        const journalLogsTable = document.createElement("table");
        journalLogsTable.id = "journal-logs-table"
        journalLogsTable.classList.add("hd-table");

        const headings = ["#", "Date & Time", "Duration", "Catches", "FTC", "FTA"];
        const keys = ["", "Timestamp", "Duration", "Catches", "Ftc", "Fta"];

        // Create headings
        for (let i = 0; i < headings.length; ++i) {
            const headingElement = document.createElement("th");
            headingElement.id = `journal-logs-${headings[i].toLowerCase()}-heading`;
            headingElement.innerText = headings[i];
            headingElement.classList.add("hd-table-heading");

            journalLogsTable.appendChild(headingElement);
        }

        // Table Body
        const tableBody = document.createElement("tbody");

        let j = 0
        for (const logId in storedData.logs) {
            const tableRow = document.createElement("tr");
            tableRow.id = "journal-logs-table-row-" + j

            for (let i = 0; i < headings.length; ++i) {
                const tdElement = document.createElement("td");
                if (i == 0) {
                    tdElement.innerText = j + 1;
                } else if (i == 1) {
                    // Link element
                    const link = document.createElement("a");
                    link.innerText = new Date(storedData.logs[logId][keys[i]]).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    link.href = "#";
                    link.addEventListener("click", function () {
                        document.querySelector("#journal-logs-popup-div").remove();
                        eval(storedData.logs[logId]["OpenSummaryMethod"]);
                        return false;
                    });

                    tdElement.append(link);
                } else {
                    tdElement.innerText = storedData.logs[logId][keys[i]];
                }

                tdElement.classList.add("hd-table-td");

                tableRow.appendChild(tdElement);
            }

            tableBody.appendChild(tableRow);

            j++;
        }

        // Final append
        journalLogsTable.appendChild(tableBody)
        journalLogs.appendChild(journalLogsTable);
        journalLogsPopup.appendChild(journalLogs);

        // Close button
        const closeButton = document.createElement("button");
        closeButton.id = "close-button";
        closeButton.textContent = "Close";
        closeButton.classList.add("hd-button");
        closeButton.onclick = function () {
            document.body.removeChild(journalLogsPopup);
        }

        // Append
        journalLogsPopup.appendChild(closeButton);

        // Final Append
        document.body.appendChild(journalLogsPopup);
        hd_utils.dragElement(journalLogsPopup, journalLogs);
    }

    function getNextLogTimer() {
        let timerString = "N/A";
        if (storedData.lastSavedEntryId !== undefined && storedData.logs[storedData.lastSavedEntryId] !== undefined) {
            const lastLogDate = new Date(storedData.logs[storedData.lastSavedEntryId].Timestamp);

            const nextLogTimestamp = lastLogDate.setHours(lastLogDate.getHours() + 36);
            const timestampDifference = Math.abs(nextLogTimestamp - Date.now());
            const hasPassed = nextLogTimestamp < Date.now();

            let hours = Math.floor(timestampDifference / 1000 / 60 / 60);
            let minutes = Math.round((timestampDifference - (hours * 1000 * 60 * 60)) / 1000 / 60);

            if (minutes === 60) {
                minutes = 0;
                hours += 1;
            }

            timerString = "";

            if (hours > 0) {
                timerString = `${hours}h`;
            }

            if (minutes > 0) {
                timerString += `${hours > 0 ? " " : ""}${minutes}m`;
            }

            if (hasPassed) {
                timerString += " ago";
            }

            if (hours == 0 && minutes == 0) {
                timerString = "Almost ready!"
            }
        }

        return timerString;
    }

    function isOwnJournal() {
        const ownJournal = document.querySelector(`#journalContainer[data-owner="${user.user_id}"] .content`);

        if (!ownJournal) {
            if (isDebug) {
                console.log(`Other hunters' profile detected`);
            }

            return false;
        }

        return true;
    }
})();