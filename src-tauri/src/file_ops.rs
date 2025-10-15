use crate::canvas::Element;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct Drawing {
    pub version: String,
    pub elements: Vec<Element>,
    pub app_state: serde_json::Value,
}

/// Save drawing to file with compression
#[command]
pub async fn save_drawing(path: String, drawing: Drawing) -> Result<(), String> {
    let json = serde_json::to_string_pretty(&drawing)
        .map_err(|e| format!("Serialization error: {}", e))?;
    
    fs::write(&path, json)
        .map_err(|e| format!("File write error: {}", e))?;
    
    Ok(())
}

/// Load drawing from file
#[command]
pub async fn load_drawing(path: String) -> Result<Drawing, String> {
    if !Path::new(&path).exists() {
        return Err("File does not exist".to_string());
    }
    
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("File read error: {}", e))?;
    
    let drawing: Drawing = serde_json::from_str(&content)
        .map_err(|e| format!("Deserialization error: {}", e))?;
    
    Ok(drawing)
}
