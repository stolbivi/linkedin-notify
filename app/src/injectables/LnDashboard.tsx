import React, {useEffect, useState} from "react";
import {
injectFirstChild, mountComponent, unmountComponent} from "../utils/InjectHelper"
// @ts-ignore
import stylesheet from "./LnDashboard.scss";
import {getTheme, SwitchThemePayload} from "../actions";
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../global";
import {applyThemeProperties as setThemeUtil, useThemeSupport} from "../themes/ThemeUtils";
import {theme as LightTheme} from "../themes/light";
import {createAction} from "@stolbivi/pirojok/lib/chrome/MessagesV2";
import {theme as DarkTheme} from "../themes/dark";
import ReactDOM from "react-dom";
import Navbar from "./dashboard/Navbar";
import { useUrlChangeSupport } from "../utils/URLChangeSupport";
import {getQuery} from "../utils/LnDashboardHelper";
import { AccessGuard, AccessState } from "./AccessGuard";

export const LnDashboardFactory = () => {
    const header = document.getElementsByClassName("global-nav__primary-items");
    if (header && header.length > 0) {
        injectFirstChild(header[0], "lnm-dashboard",
            <LnDashboard/>, "LnDashboard"
        );
    (document.querySelector("lnm-dashboard div") as HTMLElement).style.height = "100%"
  }
}
type Props = {}
type View = "candidates" | "jobList" | "search"
export const LnDashboard: React.FC<Props> = ({}) => {
    const messages = new MessagesV2(VERBOSE);
    const [_, rootElement, updateTheme] = useThemeSupport<HTMLDivElement>(messages, LightTheme);
    const [view, setView] = useState<View>("candidates")
    const [currentUrl] = useUrlChangeSupport(window.location.href)
    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);

    useEffect(() => {
        messages.request(getTheme()).then(theme => updateTheme(theme)).catch();
        messages.listen(createAction<SwitchThemePayload, any>("switchTheme",
            (payload) => {
                updateTheme(payload.theme);
                return Promise.resolve();
            }));
        messages.listen(createAction<SwitchThemePayload, any>("switchTheme",
            (payload) => {
                let theme = payload.theme === "light" ? LightTheme : DarkTheme;
                setThemeUtil(theme, rootElement);
                return Promise.resolve();
            }));

        chrome.storage.local.get(["showDashboard", "view"], function (result) {
          if (result.showDashboard && result.view) {
            setView(result.view)
            window.history.pushState({ component: result.view },"","https://www.linkedin.com/#lndashboard?view=" + result.view)
            initDashboard(result.view)
            chrome.storage.local.set({ showDashboard: false }, function () {})
          }
        })
    }, []);

    useEffect(() => {
        if(!currentUrl.includes('lndashboard')) {
          document
          .querySelectorAll(".scaffold-layout .scaffold-layout-container")
          .forEach((el: HTMLElement) => {
            el.style.display = "inherit"
          })

        rootElement.current.classList.remove("dashboard-active")
        unmountComponent("Navbar")
        } else if (currentUrl.includes("lndashboard")) {
          const el = document.getElementById('lnm-dashboard-wrapper')
          const url = window.location.href
          setView(url.split("view=")[1]?.split("&")[0] as View)
          if(!el) {
            initDashboard(view)
          }
        }
    }, [currentUrl]);



  const getDashboardWrapper = (target: HTMLElement) => {
    if (document.getElementById("lnm-dashboard-wrapper")) {
      return document.getElementById("lnm-dashboard-wrappper") as HTMLElement
    }

    document
      .querySelectorAll(".scaffold-layout-container")
      .forEach((el: HTMLElement) => {
        el.style.display = "none"
      })
    
    // get tag lnm-notes-and-charts and unmount and remove it from the dom, fixes bug where the notes and charts wouldn't load after clicking on the dashboard from a profile
    const lnmNotesAndCharts = document.querySelector('lnm-notes-and-charts')
    if (lnmNotesAndCharts) {
      unmountComponent("NotesAndCharts")
      lnmNotesAndCharts.remove()
    }


    const dashboardWrapper = document.createElement("div")
    dashboardWrapper.id = "lnm-dashboard-wrapper"
    target.appendChild(dashboardWrapper)
    return dashboardWrapper
  }

  const initDashboard = (view?: View) => {
    setTimeout(() => {
      let navBarElement =
        document.querySelector(".scaffold-layout") ||
        document.querySelector(".authentication-outlet")
      if (!navBarElement) {
        return
      }

      rootElement.current.classList.add("dashboard-active")

      const dashboardWrapper = getDashboardWrapper(navBarElement as HTMLElement)
      if (!dashboardWrapper) {
        return
      }

      document
        .getElementsByClassName("global-nav__primary-link--active")[0]
        ?.classList?.remove("global-nav__primary-link--active")

      mountComponent("Navbar", dashboardWrapper)
      ReactDOM.render(
        <Navbar handleInit={initDashboard} customView={view} />,
        dashboardWrapper
      )
    }, 100)
  }

  useEffect(() => {
    window.addEventListener("popstate", (event) => {
      if (event.state && event.state.component !== undefined) {
        initDashboard(getQuery('view') as View)
      } else if (event.state && event.state.path) {
        window.history.replaceState({ path: event.state.path },"", event.state.path)
      }
    })
  }, [])

  const dashboardClickHandler = () => {
    if(accessState !== AccessState.Valid) return
    if (document.querySelector(".scaffold-layout")) {
      window.history.pushState({ component: view },"","https://www.linkedin.com/#lndashboard?view=" + view)
      initDashboard()
    } else {
      console.warn('Navbar element not found.');
    }
  }
    return (
        <>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className="global-nav__primary-item" onClick={dashboardClickHandler} ref={rootElement} style={{cursor:"pointer"}}>
              <AccessGuard setAccessState={setAccessState} className={"access-guard-px24"}
                         loaderClassName={"loader-base loader-px24"} hideTitle/>
                {
                  accessState === AccessState.Valid && <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px"
                     width="24" height="24" className="ln-dashboard-svg" y="0px" viewBox="0 0 400 360.1" xmlSpace="preserve">
                    <g id="o_1_">
                        <g>
                            <path className="ln-dashboard-svg-color" d="M348.5,0H51.8C23.3,0,0.2,23.1,0.2,51.6v256.9c0,28.5,23.1,51.6,51.6,51.6h296.6c28.5,0,51.6-23.1,51.6-51.6V51.6
                            C400.1,23.1,377,0,348.5,0z M95.5,67.9C98,54.4,116.7,45.1,133,49.2c25.8,6.5,30.4,37.4,7.4,48.9C116.7,109.8,90.9,92.4,95.5,67.9
                            z M307.3,312.7c-1.6,0.6-45.9,0.6-47.5,0c-2.5-0.8-2.3,2.4-2.2-48.6c0.2-53.5,0.2-52.6-3.8-65.3c-6.1-19.5-23.2-28.4-43.8-22.9
                            c-22,5.9-45.5,37.4-51.4,68.6c-1.7,9.3-2,14.2-2.1,47.6c-0.1,20,0,19.3-2.6,20.4c-1.9,0.8-52,0.6-53.6-0.2c-2.2-1.1-2,5.5-2-89.6
                            c0-96.4-0.2-87.9,2.1-89.1c1.1-0.6,52.7-0.6,54.2,0c2.3,0.9,2.2-1.4,2.4,38.1c0.1,19.7,0.3,35.9,0.4,36c0.5,0.5,1-0.3,2.5-3.1
                            c4.3-8.5,21-37.2,25.5-43.8c7.2-10.5,18-21.8,25.1-26.1c10.8-6.7,24.3-9.5,39.7-8.3c27.2,2.1,47.3,20.8,54,50.5
                            c2.3,10.2,2.8,13.2,3.8,23.8c1.1,11.3,1.4,24.4,1.5,68.7C309.7,314.7,309.9,311.9,307.3,312.7z"/>
                        </g>
                    </g>
                </svg>
                }
                
                <div className="ln-dashboard-title">
                    Dashboard
                </div>
            </div>
        </>
    );
}
