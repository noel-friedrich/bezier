# bezier curve generation animator
> simulate the generation of bézier curves   
> available at [noel-friedrich.de/bezier](https://noel-friedrich.de/bezier/)

## Table of contents
* [Introduction](#introduction)
* [Tutorial](#tutorial)
* [Status](#status)

## Introduction

The website lets you make bézier-Curves.
The generation of these curves may be animated step-by-step.

![Screenshot](https://imgur.com/GvG0ohe.png "screenshot")

By combining multiple points, you can make linear, quadratic, cubic and higher-degree curves.  
The website can handle a large amount of points (100+) but the animation may not run smoothly.

## Tutorial

_this short tutorial is also visible when opening the website_

0. visit the [website](https://noel-friedrich.de/bezier/)
1. click (or touch) any position to add a point to the curve
2. add 3 or more points in total to create a bezier curve
3. click the "Animate" button to see the curve generate
   * or move the slider manually to see different stages
   
The animation time (in milliseconds) may be changed by use of a `GET`-Parameter in the URL:  
`noel-friedrich.de/bezier?t=2000` results in an animation time of 2000ms or 2s

## Status
Project is _IN PROGRESS_
