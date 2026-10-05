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

const dimensions = [
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

const backgroundColor = "#ffffff";

function getSliceColor(index) {
    return `hsl(${45 + 360 * index / dimensions.length}, 100%, 75%)`;
}

const TAU = 2 * Math.PI;
const radialPercentages = [ 0.4, 0.3, 0.3 ];

function draw() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const side = Math.min(W, H);

    const margin = side * 0.1;
    const radius = side * 0.5 - margin;
    const innerMargin = side * 0.003;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W/2, H/2);

    for (let i = 0; i < dimensions.length; i++) {
        drawSlice(ctx, i, radius, innerMargin, margin);
    }

    ctx.restore();

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
