import ReactDOM from "react-dom";
import root from "react-shadow";
import React from "react";
const componentElements = new Map<string, HTMLElement[]>();

export const inject = (target: any, tag: string, action: "before" | "after",
                       injectable:  JSX.Element | (() => Promise<JSX.Element>), componentName: string) => {
    if (document.getElementsByTagName(tag).length === 0 && isMountAllowed(componentName)) {
        let container = document.createElement(tag);
        container.classList.add(componentName);
        target[action](container);
        mountComponent(componentName, container);
        ReactDOM.render(<root.div mode={'open'}>{injectable}</root.div>, container);
    }
};

export const injectFirstChild = (target: any, tag: string, injectable:  JSX.Element | (() => Promise<JSX.Element>), componentName: string) => {
    if (document.getElementsByTagName(tag).length === 0 && isMountAllowed(componentName)) {
        let container = document.createElement(tag);
        container.classList.add(componentName);
        target.insertBefore(container, target.firstChild);
        mountComponent(componentName, container);
        ReactDOM.render(<root.div mode={'open'}>{injectable}</root.div>, container);
    }
};

export const injectLastChild = (target: any, tag: string, injectable:  JSX.Element | (() => Promise<JSX.Element>), componentName: string) => {
    if (document.getElementsByTagName(tag).length === 0 && isMountAllowed(componentName)) {
        let container = document.createElement(tag);
        container.classList.add(componentName);
        target.appendChild(container);
        mountComponent(componentName, container);
        ReactDOM.render(<root.div mode={'open'}>{injectable}</root.div>, container);
    }
};

const mountComponent = (componentName: string, container: HTMLElement) => {
    let elements = componentElements.get(componentName) || [];
    elements.push(container);
    componentElements.set(componentName, elements);
};

export const unmountComponent = (componentName: string) => {
    const elements = componentElements.get(componentName);
    if (elements && elements.length) {
        elements.forEach(container => {
            ReactDOM.unmountComponentAtNode(container);
            container.parentNode.removeChild(container);
        });
        componentElements.delete(componentName);
    }
};

const isMountAllowed = (componentName: string) => {
    const proFeatures = JSON.parse(sessionStorage.getItem("proFeatures"));
    // @ts-ignore
    const activeFeatures = Object.values(proFeatures).filter(feature => feature.isActive);
    // @ts-ignore
    return activeFeatures.find(feature => feature.id === componentName) !== undefined;
}