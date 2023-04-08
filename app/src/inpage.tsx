/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {DynamicUI} from "@stolbivi/pirojok";
import {CompletionFactory} from "./injectables/Completion";
import {SalaryPillFactory} from "./injectables/SalaryPill";
import {AutoFeatureFactory} from "./injectables/AutoFeature";
import {MapsFactory} from "./injectables/Maps";
import {StagePillFactory} from "./injectables/notes/StagePill";
import {NotesAndChartsFactory} from "./injectables/notes/NotesAndCharts";
import {NotesManagerFactory} from "./injectables/notes/NotesManager";
import {LastViewedFactory} from "./injectables/LastViewed";
import {TimeZoneFactory} from "./injectables/TimeZone";
import {LnDashboardFactory} from "./injectables/LnDashboard";
import {unmountComponent} from "./utils/InjectHelper";

console.debug('LinkedIn Manager extension engaged');

const dynamicUI = new DynamicUI();
let initialLoad = true;
let isWatchAutoFeature = false;

const componentFactoryMap = {
    Completion: { watch: true, element: CompletionFactory},
    Salary: { watch: true, element: SalaryPillFactory},
    Maps: { watch: true, element: MapsFactory},
    AutoFeature: { watch: true, element: AutoFeatureFactory},
    StagePill: { watch: true, element: StagePillFactory},
    NotesAndCharts: { watch: true, element: NotesAndChartsFactory},
    NotesManager: { watch: true, element: NotesManagerFactory},
    LastViewed: { watch: true, element: LastViewedFactory},
    TimeZone: { watch: true, element: TimeZoneFactory},
    LnDashboard: { watch: true, element: LnDashboardFactory}
};
const injectUI = () => {
    dynamicUI.watch(document, {
        subtree: true,
        childList: true,
        onAdd: (_node: Node) => {
            if(initialLoad) {
                CompletionFactory();
                SalaryPillFactory();
                MapsFactory();
                AutoFeatureFactory();
                StagePillFactory();
                NotesAndChartsFactory();
                NotesManagerFactory();
                LastViewedFactory();
                TimeZoneFactory();
                LnDashboardFactory();
            } else {
                if (isWatchAutoFeature) {
                    AutoFeatureFactory();
                }
            }
        }
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
    } else if(event.data.type === "modifyElements") {
        initialLoad = event.data.initialLoad;
        const proFeatures = JSON.parse(sessionStorage.getItem("proFeatures"));
        Object.values(proFeatures).forEach(feature => {
            if(feature.isChanged) {
                if(!feature.isActive) {
                    if("AutoFeature" === feature.id) {
                        isWatchAutoFeature = false;
                    }
                    unmountComponent(feature.id);
                } else {
                    if(componentFactoryMap[feature.id]) {
                        if("AutoFeature" === feature.id) {
                            isWatchAutoFeature = true;
                        }
                        componentFactoryMap[feature.id].element();
                    }
                }
            }
        });
    }
});