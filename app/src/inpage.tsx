import {DynamicUI} from "@stolbivi/pirojok";
import {CompletionFactory} from "./injectables/Completion";
import {SalaryPillFactory} from "./injectables/SalaryPill";
import {AutoFeatureFactory} from "./injectables/AutoFeature";
import {MapsFactory} from "./injectables/Maps";
import {StagePillFactory} from "./injectables/notes/StagePill";
import {NotesAndChartsFactory} from "./injectables/notes/NotesAndCharts";
import {NotesManagerFactory} from "./injectables/notes/NotesManager";
import {LastViewedFactory} from "./injectables/LastViewed";

console.debug('LinkedIn Manager extension engaged');

const dynamicUI = new DynamicUI();

const injectUI = () => {
    dynamicUI.watch(document, {
        subtree: true,
        childList: true,
        onAdd: (_: Node) => {
            CompletionFactory();
            SalaryPillFactory();
            MapsFactory();
            AutoFeatureFactory();
            StagePillFactory();
            NotesAndChartsFactory();
            NotesManagerFactory();
            LastViewedFactory();
        },
    });
}

injectUI();

// Send a message to the background script to inform it that the content script is ready
chrome.runtime.sendMessage({ contentScriptReady: true }, () => {
    if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError.message);
    }
});

window.addEventListener("message", (event) => {
    if (event.data && event.data.theme) {
        const htmlElement = document.documentElement;
        if (event.data.theme === "dark") {
            htmlElement.setAttribute("data-theme", "dark");
            htmlElement.classList.remove("theme--light");
            htmlElement.classList.add("theme--dark");
            document.getElementById("ui-theme-dark").removeAttribute("disabled");
        } else if (event.data.theme === "light") {
            htmlElement.setAttribute("data-theme", "light");
            htmlElement.classList.remove("theme--dark");
            htmlElement.classList.add("theme--light");
            document.getElementById("ui-theme-dark").setAttribute("disabled","true");
        }
    }
});

