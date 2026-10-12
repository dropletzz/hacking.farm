const _components = {
    themeSelector: async (mount = document.body) => {
        const response = await fetch('/theme-selector.html');
        const html = await response.text();
        _mountComponent(mount, html);
    }
};

const _mountComponent = (mount, html) => {
    const template = document.createElement('template');
    template.innerHTML = html;

    const scripts = Array.from(template.content.querySelectorAll('script'));
    scripts.forEach((script) => script.remove());

    const styles = Array.from(template.content.querySelectorAll('style'));
    styles.forEach((style) => style.remove());

    mount.appendChild(template.content);

    const recreateAndMountOn = mountPoint => {
        return sourceElem => {
            const newElem = document.createElement(sourceElem.tagName);
            for (const attr of sourceElem.attributes) {
                newElem.setAttribute(attr.name, attr.value);
            }
            newElem.textContent = sourceElem.textContent;
            mountPoint.appendChild(newElem);
        }
    }

    styles.forEach(recreateAndMountOn(document.head));
    scripts.forEach(recreateAndMountOn(mount));
}
