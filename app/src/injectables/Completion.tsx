import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, BACKEND_SIGN_IN, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";

// @ts-ignore
import stylesheet from "./Completion.scss";

type Props = {
    disabled?: boolean
};

const SCROLL_END = 100000; // just very big number to cover

export const Completion: React.FC<Props> = ({disabled}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    // @ts-ignore
    const [disabledInternal, setDisabledInternal] = useState(disabled);
    const [textEmpty, setTextEmpty] = useState(true);
    const [inProgress, setInProgress] = useState(false);
    const [editable, setEditable] = useState(null);
    const [modal, setModal] = useState(null);
    const [scrollable, setScrollable] = useState(null);
    const [text, setText] = useState<string>("");
    const [title, setTitle] = useState<string>();

    const updateWithText = (element: any) => {
        element = element.target ?? element;
        if (disabledInternal) {
            setTextEmpty(true);
            setTitle("Please, sign in to use premium features");
        } else {
            const text = element.innerText.trim();
            setText(text);
            setTextEmpty(text.length === 0);
        }
    }

    useEffect(() => {
        if (disabledInternal) {
            setTitle("Please, sign in to use premium features");
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

    const onClick = () => {
        if (disabledInternal) {
            return messages.request<IAppRequest, any>({type: AppMessageType.OpenURL, payload: {url: BACKEND_SIGN_IN}});
        }
        if (textEmpty || inProgress) {
            return;
        }
        setInProgress(true);
        return messages.request<IAppRequest, any>({
            type: AppMessageType.Completion,
            payload: text
        }, (r) => {
            if (r.error) {
                console.error(r.error);
                setInProgress(false);
                if (r.status === 403) {
                    setDisabledInternal(true);
                    setTitle("Please, sign in to use premium features");
                }
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
        if (disabledInternal) {
            return "action-base disabled";
        }
        if (inProgress) {
            return "action-base complete-progress";
        }
        return "action-base" + (textEmpty ? " complete-disabled" : " complete");
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{__html: stylesheet}}/>
            <div className={getClass()} onClick={onClick} title={title}>
                <span>AI</span>
            </div>
        </React.Fragment>
    );
};