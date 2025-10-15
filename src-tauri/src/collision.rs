use crate::canvas::{Bounds, Element, Point};
use tauri::command;

/// Check if a point is inside an element
pub fn point_in_element(point: &Point, element: &Element) -> bool {
    let bounds = element.get_bounds();
    point.x >= bounds.x
        && point.x <= bounds.x + bounds.width
        && point.y >= bounds.y
        && point.y <= bounds.y + bounds.height
}

/// Check if two bounding boxes intersect
pub fn bounds_intersect(a: &Bounds, b: &Bounds) -> bool {
    a.x < b.x + b.width
        && a.x + a.width > b.x
        && a.y < b.y + b.height
        && a.y + a.height > b.y
}

/// Fast collision detection between a point and elements
#[command]
pub fn check_collision(point: Point, elements: Vec<Element>) -> Result<Vec<String>, String> {
    use rayon::prelude::*;
    
    let colliding_ids: Vec<String> = elements
        .par_iter()
        .filter(|element| point_in_element(&point, element))
        .map(|element| match element {
            Element::Rectangle { id, .. } => id.clone(),
            Element::Ellipse { id, .. } => id.clone(),
            Element::Line { id, .. } => id.clone(),
            Element::Arrow { id, .. } => id.clone(),
        })
        .collect();
    
    Ok(colliding_ids)
}

/// Get all elements within a selection bounds
#[command]
pub fn get_elements_in_bounds(selection: Bounds, elements: Vec<Element>) -> Result<Vec<String>, String> {
    use rayon::prelude::*;
    
    let selected_ids: Vec<String> = elements
        .par_iter()
        .filter(|element| {
            let element_bounds = element.get_bounds();
            bounds_intersect(&selection, &element_bounds)
        })
        .map(|element| match element {
            Element::Rectangle { id, .. } => id.clone(),
            Element::Ellipse { id, .. } => id.clone(),
            Element::Line { id, .. } => id.clone(),
            Element::Arrow { id, .. } => id.clone(),
        })
        .collect();
    
    Ok(selected_ids)
}
