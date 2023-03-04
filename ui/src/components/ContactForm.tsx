import React, {useEffect, useState} from "react";
import {API_BASE} from "../global";

type Props = {};

export const ContactForm: React.FC<Props> = ({}) => {

    const [showSuccess, setShowSuccess] = useState<boolean>();

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("success") === "true") {
            setShowSuccess(true);
        } else if (searchParams.get("success") === "false") {
            setShowSuccess(false);
        }
    }, []);

    return (
        <React.Fragment>
            <form id="email-form" name="email-form" data-name="Email Form" method="post" className="contacts-1-form"
                  action={API_BASE + "support"}>
                <input type="text" className="text-field w-input" maxLength={256} name="name" data-name="Name"
                       placeholder="Name*" id="name" required/>
                <input type="tel" className="text-field w-input" maxLength={256} name="phone" data-name="Phone"
                       placeholder="Phone" id="Phone"/>
                <input type="email" className="text-field w-input" maxLength={256} name="email" data-name="Email"
                       placeholder="Email*" id="Email" required/>
                <div className="select-wrapper">
                    <select id="field-3" name="topic" data-name="Field 3" required className="select-field w-select">
                        <option value="">Topic*</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <textarea placeholder="Your message" maxLength={5000} id="Text-Area" name="message"
                          data-name="Text Area"
                          className="text-field text-area w-node-c9330bc4-87f5-5074-ce2c-3beb61073639-ac44116b w-input"></textarea>
                <div id="w-node-_82b641f7-efd1-253b-a922-ccaa7b77abf7-ac44116b">
                    <input type="submit" value="Submit"
                           data-wait="Please wait..."
                           id="w-node-_0b8dd6d6-e802-cd03-2267-fc2ee2800b18-ac44116b"
                           className="button w-button"/>
                </div>
            </form>
            {showSuccess && <div className="success-message w-form-done" style={{display: "block", marginTop: "1em"}}>
                <div>Thank you! Your submission has been received!</div>
            </div>}
            {showSuccess === false &&
            <div className="error-message w-form-fail" style={{display: "block", marginTop: "1em"}}>
                <div>Oops! Something went wrong while submitting the form.</div>
            </div>}
        </React.Fragment>
    );
};