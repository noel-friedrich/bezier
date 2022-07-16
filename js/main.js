const CANVAS = document.querySelector("#canvas")
const CONTEXT = CANVAS.getContext("2d")
const ANIMATE_BTN = document.querySelector("#animate-btn")
const T_SLIDER = document.querySelector("#t-slider")

function fixCanvasSize() {
    CANVAS.width = CANVAS.clientWidth
    CANVAS.height = CANVAS.clientHeight
    drawAllPoints()
    drawPreviousPoints(T_SLIDER.value / 1000)
}

addEventListener("resize", fixCanvasSize)

let POINTS = []
fixCanvasSize()

let connections = []

class Connection {
    constructor(p1, p2) {
        this.p1 = p1
        this.p2 = p2
    }

    get v() {
        return this.p2.sub(this.p1)
    }

    getPoint(t=0) {
        return this.p1.add(this.v.scale(t))
    }

    draw() {
        fillPoint(this.p1)
        fillPoint(this.p2)
        drawLine(this.p1, this.p2)
    }
}

function drawPoint(v, color="black", radius=5) {
    CONTEXT.strokeStyle = color
    CONTEXT.beginPath()
    CONTEXT.arc(v.x, v.y, radius, 0, 2 * Math.PI)
    CONTEXT.stroke()
    CONTEXT.closePath()
}

function fillPoint(v, color="red", radius=3) {
    CONTEXT.fillStyle = color
    CONTEXT.beginPath()
    CONTEXT.arc(v.x, v.y, radius, 0, 2 * Math.PI)
    CONTEXT.fill()
    CONTEXT.closePath()
}

function drawLine(v1, v2, color="rgba(0, 0, 0, 0.3)") {
    CONTEXT.strokeStyle = color
    CONTEXT.beginPath()
    CONTEXT.moveTo(v1.x, v1.y)
    CONTEXT.lineTo(v2.x, v2.y)
    CONTEXT.stroke()
    CONTEXT.closePath()
}

function getNumParam(paramNames, standardVal) {
    let urlParams = new URLSearchParams(window.location.search)
    let n = null
    for (let paramName of paramNames) {
        n = urlParams.get(paramName)
        if (n != null) break
    }
    
    return (!!n && !isNaN(n)) ? parseInt(n) : standardVal
}

let ANIMATION_TIME = getNumParam(["t", "time", "animation_time", "l", "length"], 8000)

function clearCanvas() {
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)
}

let memoryDict = {}

function bezierPoint(t) {
    if (t in memoryDict) {
        return memoryDict[t]
    }

    function reduceConnections(connections) {
        if (connections.length == 1) {
            let bezierPoint = connections[0].getPoint(t)
            return bezierPoint
        }
        let tempConnections = []
        for (let i = 1; i < connections.length; i++) {
            let connection = new Connection(
                connections[i - 1].getPoint(t),
                connections[i - 0].getPoint(t)
            )
            tempConnections.push(connection)
        }
        return reduceConnections(tempConnections)
    }

    let value = reduceConnections(connections)
    memoryDict[t] = value
    return value
}

function drawPreviousPoints(t, stepSize=0.002) {
    if (POINTS.length <= 1) return
    let prevPoint = null
    let precision = 10 ** 5
    for (let tt = t; tt >= 0; tt -= stepSize) {
        tt = Math.round(tt * precision) / precision
        let point = bezierPoint(tt)
        if (prevPoint) {
            drawLine(prevPoint, point, "red")
        }
        prevPoint = point
    }
}

function drawFromT(t, drawPrevious=true) {
    if (POINTS.length <= 1) return
    clearCanvas()

    drawAllPoints()

    if (drawPrevious)
        drawPreviousPoints(t)

    function reduceConnections(connections) {
        if (connections.length == 1) {
            connections[0].draw()
            let bezierPoint = connections[0].getPoint(t)
            drawPoint(bezierPoint, "red", 5)
            return bezierPoint
        }
        let tempConnections = []
        connections[0].draw()
        for (let i = 1; i < connections.length; i++) {
            connections[i].draw()
            let connection = new Connection(
                connections[i - 1].getPoint(t),
                connections[i - 0].getPoint(t)
            )
            tempConnections.push(connection)
        }
        return reduceConnections(tempConnections)
    }

    let bezierPoint = reduceConnections(connections)
    memoryDict[t] = bezierPoint

    if (t == 1) {
        clearCanvas()
        drawAllPoints()
        drawPreviousPoints(1)
    }

    return bezierPoint
}

function drawBezierPoints(bezierPoints) {
    for (let i = 1; i < bezierPoints.length; i++) {
        drawLine(bezierPoints[i - 1], bezierPoints[i], "red")
    }
}

T_SLIDER.oninput = function() {
    if (ANIMATION_RUNNING) return
    let t = T_SLIDER.value / 1000
    drawFromT(t)
}

function recalcConnections() {
    connections = []
    for (let i = 1; i < POINTS.length; i++) {
        connections.push(new Connection(POINTS[i - 1], POINTS[i]))
    }
    return connections
}

async function animateBezier(time=ANIMATION_TIME) {
    return new Promise(resolve => {
        const startTime = Date.now()

        let previousValues = []

        function step() {
            let t = (Date.now() - startTime) / time
            if (t > 1) {
                t = 1.0
            }

            T_SLIDER.value = Math.round(t * 1000)

            previousValues.push(drawFromT(t, false))
            drawBezierPoints(previousValues)

            if (t != 1) {
                window.requestAnimationFrame(step)
            } else {
                resolve()
            }
        }

        window.requestAnimationFrame(step)
        step()
    })
}

function drawAllPoints() {
    for (let point of POINTS) {
        drawPoint(point, "red", 8)
    }
}

let ANIMATION_RUNNING = false

async function animate() {
    if (POINTS.length < 2 || ANIMATION_RUNNING) {
        return
    }
    ANIMATE_BTN.disabled = true
    ANIMATION_RUNNING = true
    await animateBezier()
    ANIMATE_BTN.disabled = false
    ANIMATION_RUNNING = false
}

document.addEventListener("keydown", async e => {
    if (ANIMATION_RUNNING) return
    if (e.code == "Space") {
        animate()
    }
    if (e.key == "z") {
        POINTS.pop()
        memoryDict = {}
        recalcConnections()
        clearCanvas()
        drawAllPoints()
        drawFromT(T_SLIDER.value / 1000)
    }
})

ANIMATE_BTN.onclick = animate

function addPoint(x, y) {
    POINTS.push(new Vector(x, y))
    memoryDict = {}
    recalcConnections()
    clearCanvas()
    drawAllPoints()
    drawFromT(T_SLIDER.value / 1000)
    drawPoint(new Vector(x, y), "red", 8)
}

function onmouseDown(e, fromMouseMove=false) {
    if (e.target != CANVAS || ANIMATION_RUNNING) return
    let rect = CANVAS.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top

    for (let point of POINTS) {
        let distance = point.sub(new Vector(x, y)).length
        if (distance < 50) {
            point.x = x
            point.y = y
            memoryDict = {}
            clearCanvas()
            drawAllPoints()
            drawFromT(T_SLIDER.value / 1000)
            return
        }
    }
    if (!fromMouseMove)
        addPoint(x, y)
}

document.addEventListener("mousedown", onmouseDown)

document.addEventListener("touchstart", e => {
    if (e.target != CANVAS || ANIMATION_RUNNING) return
    let rect = CANVAS.getBoundingClientRect()
    let x = e.touches[0].clientX - rect.left
    let y = e.touches[0].clientY - rect.top
    addPoint(x, y)
})

let leftDown = false
document.addEventListener("mousedown", e => {
    if (e.target != CANVAS || ANIMATION_RUNNING) return
    if (e.button == 0) {
        leftDown = true
    }
})

document.addEventListener("mouseup", e => {
    if (e.target != CANVAS || ANIMATION_RUNNING) return
    if (e.button == 0) {
        leftDown = false
    }
})

document.addEventListener("mousemove", function(e) {
    if (e.target != CANVAS || ANIMATION_RUNNING)
        return
    if (leftDown)
        onmouseDown(e, true)
})

document.querySelector("#info-close-btn").onclick = () => document.querySelector("#info-popup").remove()

window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check
}

if (window.mobileCheck()) {
    for (let element of document.querySelectorAll("*")) {
        element.classList.add("mobile")
    }
}
