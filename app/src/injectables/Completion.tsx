import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";
// @ts-ignore
import stylesheet from "./Completion.scss";

type Props = {};

const SCROLL_END = 100000; // just very big number to cover

export const Completion: React.FC<Props> = ({}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    // @ts-ignore
    const [disabled, setDisabled] = useState(true);
    const [inProgress, setInProgress] = useState(false);
    const [editable, setEditable] = useState(null);
    const [modal, setModal] = useState(null);
    const [scrollable, setScrollable] = useState(null);
    const [text, setText] = useState("");

    useEffect(() => {
        function listener(e: InputEvent) {
            // @ts-ignore
            const text = e.target.innerText.trim();
            setDisabled(text.length === 0);
            setText(text);
        }

        const textDiv = document.getElementsByClassName("ql-editor");
        const modalDiv = document.getElementsByClassName("artdeco-modal");
        const scrollableDiv = document.getElementsByClassName("share-creation-state__content-scrollable");
        if (textDiv && textDiv[0]) {
            setEditable(textDiv[0]);
            setModal(modalDiv[0]);
            setScrollable(scrollableDiv[0]);
            textDiv[0].addEventListener("keyup", listener, false);
            textDiv[0].addEventListener("paste", listener, false);
        }
    }, []);

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

    const onComplete = () => {
        if (disabled || inProgress) {
            return;
        }
        setInProgress(true);
        return messages.request<IAppRequest, any>({
            type: AppMessageType.Completion,
            payload: text
        }, (r) => {
            if (r.error) {
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
        });
    }

    // check is post is populated

    const getClass = () => {
        if (inProgress) {
            return "action-base complete-progress";
        }
        return "action-base" + (disabled ? " complete-disabled" : " complete");
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className={getClass()} onClick={onComplete} title="Use AI assist to complete the post">
                <span>AI</span>
            </div>
        </React.Fragment>
    );
};