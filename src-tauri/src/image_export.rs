use crate::canvas::{Bounds, Element};
use tauri::command;
use base64::Engine;

/// Export drawing as PNG
#[command]
pub async fn export_png(
    _elements: Vec<Element>,
    bounds: Bounds,
    scale: f64,
) -> Result<String, String> {
    use image::{ImageBuffer, Rgba};
    
    let width = (bounds.width * scale) as u32;
    let height = (bounds.height * scale) as u32;
    
    // Create a blank image
    let img = ImageBuffer::from_pixel(width, height, Rgba([255u8, 255u8, 255u8, 255u8]));
    
    // TODO: Render elements to image
    // This is a placeholder - actual rendering would use a 2D graphics library
    
    // Convert to base64
    let mut buffer = Vec::new();
    img.write_to(&mut std::io::Cursor::new(&mut buffer), image::ImageFormat::Png)
        .map_err(|e| format!("PNG encoding error: {}", e))?;
    
    let base64_image = base64::engine::general_purpose::STANDARD.encode(&buffer);
    
    Ok(format!("data:image/png;base64,{}", base64_image))
}

/// Export drawing as SVG
#[command]
pub async fn export_svg(
    elements: Vec<Element>,
    bounds: Bounds,
) -> Result<String, String> {
    let mut svg = format!(
        r#"<svg xmlns="http://www.w3.org/2000/svg" width="{}" height="{}" viewBox="{} {} {} {}">"#,
        bounds.width, bounds.height, bounds.x, bounds.y, bounds.width, bounds.height
    );
    
    // Convert elements to SVG paths
    for element in elements {
        match element {
            Element::Rectangle { x, y, width, height, stroke_color, fill_color, .. } => {
                svg.push_str(&format!(
                    r#"<rect x="{}" y="{}" width="{}" height="{}" stroke="{}" fill="{}" />"#,
                    x, y, width, height, stroke_color, fill_color
                ));
            },
            Element::Ellipse { x, y, width, height, stroke_color, fill_color, .. } => {
                let cx = x + width / 2.0;
                let cy = y + height / 2.0;
                let rx = width / 2.0;
                let ry = height / 2.0;
                svg.push_str(&format!(
                    r#"<ellipse cx="{}" cy="{}" rx="{}" ry="{}" stroke="{}" fill="{}" />"#,
                    cx, cy, rx, ry, stroke_color, fill_color
                ));
            },
            Element::Line { points, stroke_color, stroke_width, .. } => {
                if !points.is_empty() {
                    let path_data: Vec<String> = points
                        .iter()
                        .enumerate()
                        .map(|(i, p)| {
                            if i == 0 {
                                format!("M {} {}", p.x, p.y)
                            } else {
                                format!("L {} {}", p.x, p.y)
                            }
                        })
                        .collect();
                    svg.push_str(&format!(
                        r#"<path d="{}" stroke="{}" stroke-width="{}" fill="none" />"#,
                        path_data.join(" "), stroke_color, stroke_width
                    ));
                }
            },
            Element::Arrow { start, end, stroke_color, stroke_width, .. } => {
                svg.push_str(&format!(
                    r#"<line x1="{}" y1="{}" x2="{}" y2="{}" stroke="{}" stroke-width="{}" />"#,
                    start.x, start.y, end.x, end.y, stroke_color, stroke_width
                ));
            },
        }
    }
    
    svg.push_str("</svg>");
    
    Ok(svg)
}
