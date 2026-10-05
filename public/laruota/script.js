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

const dimensions = loadDimensions();

const backgroundColor = "#ffffff";

function getSliceColor(index) {
    return `hsl(${45 + 360 * index / dimensions.length}, 100%, 75%)`;
}

const TAU = 2 * Math.PI;
const radialPercentages = [ 0.4, 0.3, 0.3 ];

function renderWheel(ctx, W, H) {
    const side = Math.min(W, H);

    const margin = side * 0.1;
    const radius = side * 0.5 - margin;
    const innerMargin = side * 0.003;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2);

    for (let i = 0; i < dimensions.length; i++) {
        drawSlice(ctx, i, radius, innerMargin, margin);
    }

    ctx.restore();
}

function draw() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderWheel(ctx, W, H);

    requestAnimationFrame(draw);
}

function drawSlice(ctx, index, radius, margin, outerMargin) {
    const angle = TAU / dimensions.length;
    const startAngle = angle * index;
    const endAngle = startAngle + angle;
    const color = getSliceColor(index);
    const dimension = dimensions[index];

    const radialSplit1 = radius * 0.5;
    const radialSplit2 = radius * 0.75;

    drawSlicePiece(ctx,
        0, radialSplit1 - margin, startAngle, endAngle,
        color, dimension.levels[2], true
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

    ctx.save();
    ctx.translate(
        labelRadius * Math.cos(midAngle),
        labelRadius * Math.sin(midAngle)
    );

    ctx.rotate(midAngle + Math.PI / 2);
    if (midAngle > 0 && midAngle < Math.PI) {
        ctx.rotate(Math.PI);
    }

    ctx.fillStyle = "#111";
    ctx.font = `${labelFontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(dimension.name, 0, 0);

    ctx.restore();
}

function drawSlicePiece(ctx, radialStart, radialEnd, startAngle, endAngle, color, text, radial = false) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radialStart, startAngle, endAngle);
    ctx.arc(0, 0, radialEnd, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();

    const midAngle = (startAngle + endAngle) / 2;
    const midRadius = (radialStart + radialEnd) / 2;

    const x = midRadius * Math.cos(midAngle);
    const y = midRadius * Math.sin(midAngle);
    const radialHeight = radialEnd - radialStart;
    let fontSize = 0;

    ctx.save();
    ctx.translate(x, y);

    if (radial) {
        fontSize = radialHeight * 0.1;

        ctx.rotate(midAngle);
        if (midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2) {
            ctx.rotate(Math.PI);
        }
    }
    else {
        fontSize = radialHeight * 0.25;

        ctx.rotate(midAngle + Math.PI / 2);
        if (midAngle > 0 && midAngle < Math.PI) {
            ctx.rotate(Math.PI);
        }
    }

    ctx.fillStyle = "#222";
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = splitIntoLines(text, 12);
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

function renderDimensions() {
    dimensionsList.innerHTML = "";

    if (dimensions.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "Nessuna dimensione. Aggiungine una per iniziare.";
        dimensionsList.appendChild(empty);
        return;
    }

    dimensions.forEach((dimension, index) => {
        const card = document.createElement("div");
        card.className = "dimension";

        // Name + remove button
        const header = document.createElement("header");

        const nameInput = document.createElement("input");
        nameInput.className = "dimension-name";
        nameInput.type = "text";
        nameInput.value = dimension.name;
        nameInput.placeholder = "Nome della dimensione";
        nameInput.addEventListener("input", () => {
            dimension.name = nameInput.value;
            saveDimensions();
        });

        const removeButton = document.createElement("button");
        removeButton.className = "remove";
        removeButton.type = "button";
        removeButton.title = "Rimuovi dimensione";
        removeButton.textContent = "×";
        removeButton.addEventListener("click", () => {
            dimensions.splice(index, 1);
            saveDimensions();
            renderDimensions();
        });

        header.append(nameInput, removeButton);
        card.appendChild(header);

        // The three dimensio levels
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
                saveDimensions();
            });

            row.append(number, input);
            levels.appendChild(row);
        });

        card.appendChild(levels);
        dimensionsList.appendChild(card);
    });
}

addDimensionButton.addEventListener("click", () => {
    dimensions.push({
        name: "Nuova dimensione",
        levels: ["Livello 1", "Livello 2", "Livello 3"],
    });
    saveDimensions();
    renderDimensions();
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

function loadDimensions() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = parseDimensions(JSON.parse(raw));
            if (parsed) {
                return parsed;
            }
        }
    } catch (error) {
        // Corrupted data: fall through to defaults below.
    }

    return defaultDimensions.map(d => ({ name: d.name, levels: [...d.levels] }));
}

function saveDimensions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dimensions));
}

function setDimensions(next) {
    dimensions.length = 0;
    dimensions.push(...next);
    saveDimensions();
    renderDimensions();
}

function downloadDimensions() {
    const blob = new Blob([JSON.stringify(dimensions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dimensioni.json";
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

function handleDimensionFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = parseDimensions(JSON.parse(reader.result));
            if (parsed) {
                setDimensions(parsed);
            }
            else {
                alert("File non valido: deve essere un array di dimensioni.");
            }
        }
        catch (error) {
            alert("File non valido: JSON illeggibile.");
        }
    };
    reader.readAsText(file);
}


// topbar actions

document.getElementById("save-file").addEventListener("click", downloadDimensions);

document.getElementById("download-png").addEventListener("click", downloadWheelPng);

document.getElementById("load-file").addEventListener("click", () => {
    document.getElementById("load-file-input").click();
});

document.getElementById("load-file-input").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        handleDimensionFile(file);
    }
    event.target.value = "";
});

document.getElementById("reset").addEventListener("click", () => {
    setDimensions(defaultDimensions.map(d => ({ name: d.name, levels: [...d.levels] })));
});

