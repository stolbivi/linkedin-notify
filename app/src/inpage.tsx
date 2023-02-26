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