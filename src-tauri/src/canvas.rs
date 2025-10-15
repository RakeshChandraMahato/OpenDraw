use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Bounds {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum Element {
    Rectangle {
        id: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        angle: f64,
        stroke_color: String,
        fill_color: String,
    },
    Ellipse {
        id: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        angle: f64,
        stroke_color: String,
        fill_color: String,
    },
    Line {
        id: String,
        points: Vec<Point>,
        stroke_color: String,
        stroke_width: f64,
    },
    Arrow {
        id: String,
        start: Point,
        end: Point,
        stroke_color: String,
        stroke_width: f64,
    },
}

impl Element {
    pub fn get_bounds(&self) -> Bounds {
        match self {
            Element::Rectangle { x, y, width, height, .. } => Bounds {
                x: *x,
                y: *y,
                width: *width,
                height: *height,
            },
            Element::Ellipse { x, y, width, height, .. } => Bounds {
                x: *x,
                y: *y,
                width: *width,
                height: *height,
            },
            Element::Line { points, .. } => {
                if points.is_empty() {
                    return Bounds { x: 0.0, y: 0.0, width: 0.0, height: 0.0 };
                }
                let min_x = points.iter().map(|p| p.x).fold(f64::INFINITY, f64::min);
                let max_x = points.iter().map(|p| p.x).fold(f64::NEG_INFINITY, f64::max);
                let min_y = points.iter().map(|p| p.y).fold(f64::INFINITY, f64::min);
                let max_y = points.iter().map(|p| p.y).fold(f64::NEG_INFINITY, f64::max);
                Bounds {
                    x: min_x,
                    y: min_y,
                    width: max_x - min_x,
                    height: max_y - min_y,
                }
            },
            Element::Arrow { start, end, .. } => {
                let min_x = start.x.min(end.x);
                let max_x = start.x.max(end.x);
                let min_y = start.y.min(end.y);
                let max_y = start.y.max(end.y);
                Bounds {
                    x: min_x,
                    y: min_y,
                    width: max_x - min_x,
                    height: max_y - min_y,
                }
            },
        }
    }
}

/// Fast rendering command - processes elements in parallel
#[command]
pub fn render_elements(elements: Vec<Element>) -> Result<String, String> {
    use rayon::prelude::*;
    
    // Process elements in parallel for better performance
    let processed: Vec<_> = elements
        .par_iter()
        .map(|element| {
            // Perform any preprocessing here
            element.clone()
        })
        .collect();
    
    Ok(format!("Rendered {} elements", processed.len()))
}

/// Calculate bounding box for multiple elements
#[command]
pub fn calculate_bounds(elements: Vec<Element>) -> Result<Bounds, String> {
    if elements.is_empty() {
        return Ok(Bounds { x: 0.0, y: 0.0, width: 0.0, height: 0.0 });
    }
    
    let bounds: Vec<Bounds> = elements.iter().map(|e| e.get_bounds()).collect();
    
    let min_x = bounds.iter().map(|b| b.x).fold(f64::INFINITY, f64::min);
    let max_x = bounds.iter().map(|b| b.x + b.width).fold(f64::NEG_INFINITY, f64::max);
    let min_y = bounds.iter().map(|b| b.y).fold(f64::INFINITY, f64::min);
    let max_y = bounds.iter().map(|b| b.y + b.height).fold(f64::NEG_INFINITY, f64::max);
    
    Ok(Bounds {
        x: min_x,
        y: min_y,
        width: max_x - min_x,
        height: max_y - min_y,
    })
}
