let canvas = document.querySelector('canvas')
canvas.width = 600
canvas.height = 400
const context = canvas.getContext('2d')
let randomPointsButton = document.querySelector('.randomPoints')
let convexHullButton = document.querySelector('.convexHull')
let points = []
let edgesAbove = []
let edgesBelow = []

// Creates 50 random points within the canvas
randomPointsButton.addEventListener('click', function () {
  points = []
  edgesBelow = []
  edgesAbove = []
  for (let i = 0; i < 50; i++) {
    points.push({ xPos: Math.random() * (canvas.width - 100) + 50, yPos: Math.random() * (canvas.height - 100) + 50 })
  }
  drawPoints()
})

// Determines the convex hull of the randomly generated points using an implementation of the quick hull algorithm
convexHullButton.addEventListener('click', function () {
  if (edgesAbove.length === 0) {
    points.sort(function (a, b) {
      if (a.xPos < b.xPos) return -1
      if (a.Xpos > b.xPos) return 1
      return 0
    })
    edgesAbove.push({ start: points[0], end: points[points.length - 1] })
    edgesBelow.push({ start: points[0], end: points[points.length - 1] })
  } else {
    let mostDistantPoint
    let newEdgesAbove = []
    let newEdgesBelow = []
    for (let edge of edgesAbove) {
      mostDistantPoint = getMostDistantPoint(edge, points.filter(point => isAboveLine(edge, point)))
      if (mostDistantPoint === undefined) {
        newEdgesAbove.push(edge)
      } else {
        newEdgesAbove.push({ start: edge.start, end: mostDistantPoint })
        newEdgesAbove.push({ start: edge.end, end: mostDistantPoint })
      }
    }
    for (let edge of edgesBelow) {
      mostDistantPoint = getMostDistantPoint(edge, points.filter(point => isBelowLine(edge, point)))
      if (mostDistantPoint === undefined) {
        newEdgesBelow.push(edge)
      } else {
        newEdgesBelow.push({ start: edge.start, end: mostDistantPoint })
        newEdgesBelow.push({ start: edge.end, end: mostDistantPoint })
      }
    }
    edgesBelow = newEdgesBelow
    edgesAbove = newEdgesAbove
  }
  drawEdges()
})

// Draws all points in the points array onto the canvas
function drawPoints () {
  context.clearRect(0, 0, canvas.width, canvas.height)
  for (let point of points) {
    context.beginPath()
    context.fillStyle = 'red'
    context.strokeStyle = 'red'
    context.arc(point.xPos, point.yPos, 3, 0, Math.PI * 2)
    context.fill()
  }
}

// Draws the edges out of edgesAbove and edgesBelow onto the canvas
function drawEdges () {
  context.clearRect(0, 0, canvas.width, canvas.height)
  drawPoints()
  for (let edge of edgesAbove) {
    context.beginPath()
    context.strokeStyle = 'yellow'
    context.moveTo(edge.start.xPos, edge.start.yPos)
    context.lineTo(edge.end.xPos, edge.end.yPos)
    context.stroke()
  }
  for (let edge of edgesBelow) {
    context.beginPath()
    context.strokeStyle = 'yellow'
    context.moveTo(edge.start.xPos, edge.start.yPos)
    context.lineTo(edge.end.xPos, edge.end.yPos)
    context.stroke()
  }
}

// Returns the most distant point away from edge out of given points
function getMostDistantPoint (edge, filteredPoints) {
  let mostDistantPoint = filteredPoints[0]
  for (let i = 1; i < filteredPoints.length; i++) {
    if (getDistance(edge, filteredPoints[i]) > getDistance(edge, mostDistantPoint)) {
      mostDistantPoint = filteredPoints[i]
    }
  }
  return mostDistantPoint
}

// Computes the distance between an edge and a point
function getDistance (edge, point) {
  return distance(point, getInterceptWithPerpendicular(edge, point))
}

// Determines the perpendicular through point and returns the intercept with edge
function getInterceptWithPerpendicular (edge, point) {
  let line1 = edgeToLine(edge)
  let line2 = { m: undefined, t: undefined }
  line2.m = -1 / line1.m
  line2.t = point.yPos - line2.m * point.xPos
  return getInterceptOfLines(line1, line2)
}

// Calculates the intercept of two lines
function getInterceptOfLines (line1, line2) {
  return { xPos: (line2.t - line1.t) / (line1.m - line2.m), yPos: (line1.m * line2.t - line2.m * line1.t) / (line1.m - line2.m) }
}

// Transforms an edge object with start and end point to an equivalent line object with slope and axis intercept
function edgeToLine (edge) {
  let slope = (edge.end.yPos - edge.start.yPos) / (edge.end.xPos - edge.start.xPos)
  let axisIntercept = edge.start.yPos - slope * edge.start.xPos
  return { m: slope, t: axisIntercept }
}

// Computes the distance between two points in two dimensional space
function distance (pointA, pointB) {
  return Math.sqrt(Math.pow(pointA.xPos - pointB.xPos, 2) + Math.pow(pointA.yPos - pointB.yPos, 2))
}

// Returns true if point is below given edge
function isBelowLine (edge, point) {
  let line = edgeToLine(edge)
  return point.yPos > line.m * point.xPos + line.t
}

// Returns true if point is above given edge
function isAboveLine (edge, point) {
  let line = edgeToLine(edge)
  return point.yPos < line.m * point.xPos + line.t
}
