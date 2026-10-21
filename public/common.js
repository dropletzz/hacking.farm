const _components = {
    themeSelector: async (mount = document.body) => {
        const response = await fetch('/theme-selector.html');
        const html = await response.text();
        _mountComponent(mount, html);
    },
    eduExplorer: async (mount = document.body) => {
        const response = await fetch('/edu/explorer.html');
        const html = await response.text();
        _mountComponent(mount, html, true);
    },
};

const _mountComponent = (mount, html, prepend = false) => {
    const template = document.createElement('template');
    template.innerHTML = html;

    const recreateAndMountOn = mountPoint => {
        return sourceElem => {
            const newElem = document.createElement(sourceElem.tagName);
            for (const attr of sourceElem.attributes) {
                newElem.setAttribute(attr.name, attr.value);
            }
            newElem.textContent = sourceElem.textContent;
            mountPoint.append(newElem);
        }
    }

    const styles = Array.from(template.content.querySelectorAll('style'));
    styles.forEach((style) => style.remove());
    styles.forEach(recreateAndMountOn(document.head));

    const scripts = Array.from(template.content.querySelectorAll('script'));
    scripts.forEach((script) => script.remove());
    scripts.forEach(recreateAndMountOn(template.content));

    if (prepend) mount.prepend(template.content)
    else         mount.append(template.content)
}
