import React, {useEffect, useState} from "react";
import {Messages} from "@stolbivi/pirojok";
import {AppMessageType, IAppRequest, MESSAGE_ID, VERBOSE} from "../global";

type Props = {};

export const Completion: React.FC<Props> = ({}) => {

    const messages = new Messages(MESSAGE_ID, VERBOSE);

    // @ts-ignore
    const [disabled, setDisabled] = useState(true);
    const [inProgress, setInProgress] = useState(false);
    const [editable, setEditable] = useState(null);
    const [text, setText] = useState("");

    useEffect(() => {
        const textDiv = document.getElementsByClassName("ql-editor");
        if (textDiv && textDiv[0]) {
            setEditable(textDiv[0]);
            textDiv[0].addEventListener("input", (e: InputEvent) => {
                // @ts-ignore
                const text = e.target.innerText;
                setDisabled(text.length === 0);
                setText(text);
            }, false);

        }
    }, []);

    const simulateTyping = (text: string, position: number = 0) => {
        if (position < text.length) {
            setTimeout(() => {
                editable.innerText = text.substring(0, position);
                simulateTyping(text, position + 1);
            }, 5);
        } else {
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
            if (r.response[0] || r.response[0].text) {
                const result = r.response[0].text.replace(/\n\s*\n/g, ' ').trim();
                simulateTyping(result, 0);
            } else {
                console.error(JSON.stringify(r.rsponse));
                setInProgress(false)
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
        <div className={getClass()} onClick={onComplete}>
            <span>AI</span>
        </div>
    );
};