const STORAGE_KEY = "laruota.dimensions";

// wheel drawing

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
}
window.addEventListener("resize", resize);
resize();

const defaultDimensions = [
    {
        name: "Condizione economica",
        levels: [ "Indigenza", "Nella media", "Agiatezza" ],
    },
    {
        name: "Neurodiversità",
        levels: [ "Neurodivergenza significativa", "Neurodivergenza", "Neurotipicità" ],
    },
    {
        name: "Genere",
        levels: [ "Altro", "Donna cisgender", "Uomo cisgender" ],
    },
    {
        name: "Orientamento sessuale",
        levels: [ "Altro", "Omosessuale", "Eterosessuale" ],
    },
    {
        name: "Disabilità",
        levels: [ "Visibile", "Non visibile", "Nessuna" ],
    },
];

const defaultWheelDescription = {
    center: "Potere",
    dimensions: defaultDimensions,
};

const wheelDescription = loadWheelDescription();

const backgroundColor = "#ffffff";

const rainbowColors = [
    "#e40303",
    "#ff8c00",
    "#ffed00",
    "#008026",
    "#24408e",
    "#732982",
];

const dimensionNameMaxCharsBase = 30;
const levelMaxCharsBase = 20;
const radialLevelMaxChars = 12;
const maxCharsMin = 5;

function getMaxCharsPerLine(base, slope) {
    return Math.max(maxCharsMin, Math.round(base - wheelDescription.dimensions.length * slope));
}

function getSliceColor(index) {
    const goldenAngle = 137.508;
    const hue = (45 + index * goldenAngle) % 360;
    return `hsl(${hue}, 100%, 75%)`;
}

const TAU = 2 * Math.PI;
const radialPercentages = [ 0.4, 0.3, 0.3 ];

function mod(a, n) {
    return ((a % n) + n) % n;
}

function isWheelTopside(angle) {
    const a = mod(angle, TAU);
    return a > 0 && a < Math.PI;
}

function isWheelLeftside(angle) {
    const a = mod(angle, TAU);
    return a > Math.PI / 2 && a < (3 * Math.PI) / 2;
}

function drawRainbowFlag(ctx, W, H) {
    const stripeHeight = H / rainbowColors.length;

    rainbowColors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(0, i * stripeHeight, W, stripeHeight + 1);
    });
}

function draw() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderWheel(ctx, W, H);

    requestAnimationFrame(draw);
}

const radialRatio0 = 0.2;
const radialRatio1 = 0.5;
const radialRatio2 = 0.75;

function renderWheel(ctx, W, H) {
    const side = Math.min(W, H);

    const margin = side * 0.1;
    const radius = side * 0.5 - margin;
    const innerMargin = side * 0.003;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, W, H);

    if (wheelDescription.dimensions.length === 0) {
        drawRainbowFlag(ctx, W, H);
        return;
    }

    ctx.save();
    ctx.translate(W / 2, H / 2);

    drawCenter(ctx, wheelDescription.center, radius * radialRatio0 - innerMargin);

    for (let i = 0; i < wheelDescription.dimensions.length; i++) {
        drawSlice(ctx, i, radius, innerMargin, margin);
    }

    ctx.restore();
}

function drawSlice(ctx, index, radius, margin, outerMargin) {
    const angle = TAU / wheelDescription.dimensions.length;

    const startAngle = angle * index + TAU / 4;
    const endAngle = startAngle + angle;
    const color = getSliceColor(index);
    const dimension = wheelDescription.dimensions[index];

    const radialSplit0 = radius * radialRatio0;
    const radialSplit1 = radius * radialRatio1;
    const radialSplit2 = radius * radialRatio2;

    drawSlicePiece(ctx,
        radialSplit0 + margin, radialSplit1 - margin, startAngle, endAngle,
        color, dimension.levels[2]
    );
    drawSlicePiece(ctx,
        radialSplit1 + margin, radialSplit2 - margin, startAngle, endAngle,
        color, dimension.levels[1]
    );
    drawSlicePiece(ctx,
        radialSplit2 + margin, radius, startAngle, endAngle,
        color, dimension.levels[0]
    );

    const midAngle = startAngle + angle / 2;
    const labelRadius = radius + outerMargin / 2;
    const labelFontSize = Math.round(outerMargin * 0.3);
    const maxCharsPerLine = getMaxCharsPerLine(dimensionNameMaxCharsBase, 1.5);

    ctx.save();
    ctx.translate(
        labelRadius * Math.cos(midAngle),
        labelRadius * Math.sin(midAngle)
    );

    ctx.rotate(midAngle + Math.PI / 2);
    if (isWheelTopside(midAngle)) {
        ctx.rotate(Math.PI);
    }

    ctx.fillStyle = "#111";
    ctx.font = `${labelFontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = splitIntoLines(dimension.name, maxCharsPerLine);
    const lineHeight = labelFontSize * 1.2;
    const totalHeight = lines.length * lineHeight;

    lines.forEach((line, i) => {
        const y = -totalHeight / 2 + lineHeight * (i + 0.5);
        ctx.fillText(line, 0, y);
    });

    ctx.restore();
}

function drawCenter(ctx, text, centerRadius) {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = splitIntoLines(text, 12);
    const fontSize = centerRadius * 0.4;
    ctx.font = `${fontSize}px sans-serif`;

    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;

    lines.forEach((line, i) => {
        const y = -totalHeight / 2 + lineHeight * (i + 0.5);
        ctx.fillText(line, 0, y);
    });
}

function drawSlicePiece(ctx, radialStart, radialEnd, startAngle, endAngle, color, text) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radialStart, startAngle, endAngle);
    ctx.arc(0, 0, radialEnd, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();

    const midAngle = (startAngle + endAngle) / 2;
    const radialHeight = Math.abs(radialEnd - radialStart);
    const radialMid = (radialStart + radialEnd) / 2
    const arcAngle = Math.abs(endAngle - startAngle);
    const arcLength = radialMid * arcAngle;

    const isRadialOriented = radialHeight > arcLength;

    const fontSize = isRadialOriented
        ? radialHeight * 0.13
        : Math.min(arcLength * 0.1, radialHeight * 0.25);

    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = splitIntoLines(
        text,
        isRadialOriented ? radialLevelMaxChars : getMaxCharsPerLine(levelMaxCharsBase, 0.75)
    );

    // Radial text runs along the radius; push it as far from the center as
    // possible while keeping it inside its piece.
    let midRadius;
    if (isRadialOriented) {
        let maxLineWidth = 0;
        for (const line of lines) {
            maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
        }
        const radialPadding = radialHeight * 0.07;
        midRadius = Math.max(
            (radialStart + radialEnd) / 2,
            radialEnd - maxLineWidth / 2 - radialPadding
        );
    }
    else {
        midRadius = (radialStart + radialEnd) / 2;
    }

    const x = midRadius * Math.cos(midAngle);
    const y = midRadius * Math.sin(midAngle);

    ctx.save();
    ctx.translate(x, y);

    if (isRadialOriented) {
        ctx.rotate(midAngle);
        if (isWheelLeftside(midAngle)) ctx.rotate(Math.PI);
    }
    else {
        ctx.rotate(midAngle + Math.PI / 2);
        if (isWheelTopside(midAngle)) ctx.rotate(Math.PI);
    }

    ctx.fillStyle = "#222";

    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;

    lines.forEach((line, i) => {
        const y = -totalHeight / 2 + lineHeight * (i + 0.5);
        ctx.fillText(line, 0, y);
    });

    ctx.restore();
}

function splitIntoLines(text, maxCharactersPerLine) {
    const result = [];
    const words = text.split(/\s+/).filter(word => word.length > 0);

    let currentLine = "";

    for (const word of words) {
        if (currentLine === "") {
            currentLine = word;
        }
        else if ((currentLine + " " + word).length <= maxCharactersPerLine) {
            currentLine += " " + word;
        }
        else {
            result.push(currentLine);
            currentLine = word;
        }
    }

    if (currentLine !== "") {
        result.push(currentLine);
    }

    return result;
}

requestAnimationFrame(draw);


// dimensions editor

const dimensionsList = document.getElementById("dimensions-list");
const addDimensionButton = document.getElementById("add-dimension");
const addDimensionTopButton = document.getElementById("add-dimension-top");
const centerInput = document.getElementById("center-input");

let editingIndex = null;

function renderDimensions() {
    centerInput.value = wheelDescription.center;

    addDimensionTopButton.classList.toggle("hidden", wheelDescription.dimensions.length === 0);

    dimensionsList.innerHTML = "";

    if (wheelDescription.dimensions.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "Nessuna dimensione. Aggiungine una per iniziare.";
        dimensionsList.appendChild(empty);
        return;
    }

    wheelDescription.dimensions.forEach((dimension, index) => {
        const card = index === editingIndex
            ? createDimensionEditor(dimension, index)
            : createDimensionSummary(dimension, index);
        dimensionsList.appendChild(card);
    });

    if (editingIndex !== null) {
        const nameInput = dimensionsList.querySelector(".dimension-name");
        if (nameInput) {
            nameInput.focus();
        }
    }
}

function createDimensionSummary(dimension, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "dimension summary";

    const title = document.createElement("span");
    title.className = "dimension-title";
    title.textContent = dimension.name || "Senza nome";

    const levels = document.createElement("span");
    levels.className = "dimension-summary";
    levels.textContent = dimension.levels.join(" · ");

    card.append(title, levels);

    card.addEventListener("click", () => {
        editingIndex = index;
        renderDimensions();
    });

    return card;
}

function createDimensionEditor(dimension, index) {
    const card = document.createElement("div");
    card.className = "dimension";

    // Name + actions
    const header = document.createElement("header");

    const nameInput = document.createElement("input");
    nameInput.className = "dimension-name";
    nameInput.type = "text";
    nameInput.value = dimension.name;
    nameInput.placeholder = "Nome della dimensione";
    nameInput.addEventListener("input", () => {
        dimension.name = nameInput.value;
        saveWheelDescription();
    });

    const removeButton = document.createElement("button");
    removeButton.className = "remove";
    removeButton.type = "button";
    removeButton.title = "Rimuovi dimensione";
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => {
        wheelDescription.dimensions.splice(index, 1);
        if (editingIndex === index) {
            editingIndex = null;
        }
        else if (editingIndex > index) {
            editingIndex--;
        }
        saveWheelDescription();
        renderDimensions();
    });

    header.append(nameInput, removeButton);
    card.appendChild(header);

    // The three levels
    const levels = document.createElement("div");
    levels.className = "levels";

    dimension.levels.forEach((level, levelIndex) => {
        const row = document.createElement("label");
        row.className = "level";

        const number = document.createElement("span");
        number.textContent = levelIndex + 1;

        const input = document.createElement("input");
        input.type = "text";
        input.value = level;
        input.placeholder = `Livello ${levelIndex + 1}`;
        input.addEventListener("input", () => {
            dimension.levels[levelIndex] = input.value;
            saveWheelDescription();
        });

        row.append(number, input);
        levels.appendChild(row);
    });

    card.appendChild(levels);

    return card;
}

addDimensionButton.addEventListener("click", () => {
    wheelDescription.dimensions.push({
        name: "Nuova dimensione",
        levels: ["Livello 1", "Livello 2", "Livello 3"],
    });
    editingIndex = wheelDescription.dimensions.length - 1;
    saveWheelDescription();
    renderDimensions();
});

addDimensionTopButton.addEventListener("click", () => {
    wheelDescription.dimensions.unshift({
        name: "Nuova dimensione",
        levels: ["Livello 1", "Livello 2", "Livello 3"],
    });
    editingIndex = 0;
    saveWheelDescription();
    renderDimensions();
});

centerInput.addEventListener("input", () => {
    wheelDescription.center = centerInput.value;
    saveWheelDescription();
});

renderDimensions();

function parseDimensions(parsed) {
    if (!Array.isArray(parsed)) {
        return null;
    }

    return parsed
        .filter(d => d && typeof d.name === "string" && Array.isArray(d.levels))
        .map(d => ({
            name: d.name,
            levels: [
                String(d.levels[0] ?? ""),
                String(d.levels[1] ?? ""),
                String(d.levels[2] ?? ""),
            ],
        }));
}

function normalizeWheelDescription(parsed) {
    if (Array.isArray(parsed)) {
        // Legacy format: a plain array of dimensions.
        return {
            center: defaultWheelDescription.center,
            dimensions: parseDimensions(parsed) ?? [],
        };
    }

    if (parsed && typeof parsed === "object") {
        return {
            center: typeof parsed.center === "string" ? parsed.center : defaultWheelDescription.center,
            dimensions: parseDimensions(parsed.dimensions) ?? [],
        };
    }

    return null;
}

function defaultWheelDescriptionCopy() {
    return {
        center: defaultWheelDescription.center,
        dimensions: defaultWheelDescription.dimensions.map(d => ({ name: d.name, levels: [...d.levels] })),
    };
}

function loadWheelDescription() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const normalized = normalizeWheelDescription(JSON.parse(raw));
            if (normalized) {
                return normalized;
            }
        }
    } catch (error) {
        // Corrupted data: fall through to defaults below.
    }

    return defaultWheelDescriptionCopy();
}

function saveWheelDescription() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wheelDescription));
}

function setWheelDescription(next) {
    wheelDescription.center = next.center;
    wheelDescription.dimensions.length = 0;
    wheelDescription.dimensions.push(...next.dimensions);
    editingIndex = null;
    saveWheelDescription();
    renderDimensions();
}

function downloadWheelDescription() {
    const blob = new Blob([JSON.stringify(wheelDescription, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ruota.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function downloadWheelPng() {
    const size = 1024;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = size;
    exportCanvas.height = size;

    const exportCtx = exportCanvas.getContext("2d");
    renderWheel(exportCtx, size, size);

    exportCanvas.toBlob((blob) => {
        if (!blob) {
            alert("Errore durante l'esportazione dell'immagine.");
            return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ruota.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }, "image/png");
}

function handleWheelDescriptionFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const normalized = normalizeWheelDescription(JSON.parse(reader.result));
            if (normalized) {
                setWheelDescription(normalized);
            }
            else {
                alert("File non valido: deve essere una descrizione della ruota.");
            }
        }
        catch (error) {
            alert("File non valido: JSON illeggibile.");
        }
    };
    reader.readAsText(file);
}


// topbar actions

document.getElementById("save-file").addEventListener("click", downloadWheelDescription);

document.getElementById("download-png").addEventListener("click", downloadWheelPng);

document.getElementById("load-file").addEventListener("click", () => {
    document.getElementById("load-file-input").click();
});

document.getElementById("load-file-input").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        handleWheelDescriptionFile(file);
    }
    event.target.value = "";
});

document.getElementById("reset").addEventListener("click", () => {
    setWheelDescription(defaultWheelDescriptionCopy());
});

