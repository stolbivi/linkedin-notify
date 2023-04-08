import React, {useEffect, useState} from "react";
import {MessagesV2} from "@stolbivi/pirojok";
import {VERBOSE} from "../global";
import {inject} from "../utils/InjectHelper";
import {AccessGuard, AccessState} from "./AccessGuard";

// @ts-ignore
import stylesheet from "./Completion.scss";
import {completion} from "../actions";

type Props = {};

const SCROLL_END = 100000; // just very big number to cover

export const CompletionFactory = () => {
    const modalElement = document.getElementById('artdeco-modal-outlet');
    if (modalElement) {
        const actions = modalElement.getElementsByClassName("share-box_actions");
        if (actions && actions.length > 0) {
            inject(actions[0], "lnm-completion", "before",
                <Completion/>,"Completion"
            );
        }
    }
}

export const Completion: React.FC<Props> = ({}) => {

    const messages = new MessagesV2(VERBOSE);

    const [accessState, setAccessState] = useState<AccessState>(AccessState.Unknown);
    const [textEmpty, setTextEmpty] = useState(true);
    const [inProgress, setInProgress] = useState(false);
    const [editable, setEditable] = useState(null);
    const [modal, setModal] = useState(null);
    const [scrollable, setScrollable] = useState(null);
    const [text, setText] = useState<string>("");
    const [title, setTitle] = useState<string>();

    const updateWithText = (element: any) => {
        element = element.target ?? element;
        const text = element.innerText.trim();
        setText(text);
        setTextEmpty(text.length === 0);
    }

    useEffect(() => {
        if (accessState !== AccessState.Valid) {
            return;
        }
        setTitle("Use AI assist to complete the post");
        const textDiv = document.getElementsByClassName("ql-editor");
        const modalDiv = document.getElementsByClassName("artdeco-modal");
        const scrollableDiv = document.getElementsByClassName("share-creation-state__content-scrollable");
        if (textDiv && textDiv[0]) {
            setEditable(textDiv[0]);
            setModal(modalDiv[0]);
            setScrollable(scrollableDiv[0]);
            textDiv[0].addEventListener("keyup", updateWithText, false);
            textDiv[0].addEventListener("paste", updateWithText, false);
            updateWithText(textDiv[0]);
        }
    }, [accessState]);

    const simulateTyping = (text: string, position: number = 0) => {
        if (position < text.length) {
            setTimeout(() => {
                editable.innerText = text.substring(0, position);
                modal.scrollTop = SCROLL_END;
                scrollable.scrollTop = SCROLL_END;
                simulateTyping(text, position + 3);
            }, 1);
        } else {
            editable.innerText = text;
            modal.scrollTop = SCROLL_END;
            scrollable.scrollTop = SCROLL_END;
            setInProgress(false)
        }
    }

    const onClick = () => {
        setInProgress(true);
        return messages.request(completion(text))
            .then((r) => {
                if (r.error) {
                    console.error(r.error);
                    setInProgress(false);
                    return;
                }
                if (r.response[0] || r.response[0].text) {
                    const result = r.response[0].text.replace(/^\s+|\s+$/g, '');
                    simulateTyping(result, 0);
                } else {
                    console.error(JSON.stringify(r.rsponse));
                    setInProgress(false);
                }
            })
    }

    const getClass = () => {
        if (inProgress) {
            return "action-base complete-progress";
        }
        return "action-base" + (textEmpty ? " complete-disabled" : " complete");
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <AccessGuard setAccessState={setAccessState} className={"access-guard-px16"}
                         loaderClassName={"loader-base loader-px24"} hideTitle/>
            {accessState === AccessState.Valid &&
                <div className={getClass()} onClick={onClick} title={title}>
                    <span>AI</span>
                </div>}
        </React.Fragment>
    );
};