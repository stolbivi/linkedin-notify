import React, { useState } from "react"
import ReactDOM from "react-dom"
import { MapsLoader } from "./MapsLoader"
import { Provider } from "react-redux"
import { localStore } from "../store/LocalStore"
import "./loader.scss"
import { AccessGuard, AccessState } from "../injectables/AccessGuard"

function MapComponent() {
  const [accessState, setAccessState] = useState<AccessState>(
    AccessState.Unknown
  )
  return (
    <Provider store={localStore}>
      {accessState !== AccessState.Valid ? (
        <div className="access-guard-map-wrapper">
          <AccessGuard
            setAccessState={setAccessState}
            className={"access-guard-px24"}
            loaderClassName={"loader-base loader-px24"}
          />
        </div>
      ) : (
        <MapsLoader />
      )}
    </Provider>
  )
}

ReactDOM.render(<MapComponent />, document.getElementById("root"))
