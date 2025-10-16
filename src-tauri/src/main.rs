// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod canvas;
mod collision;
mod file_ops;
mod image_export;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            canvas::render_elements,
            canvas::calculate_bounds,
            file_ops::save_drawing,
            file_ops::load_drawing,
            image_export::export_png,
            image_export::export_svg,
            collision::check_collision,
            collision::get_elements_in_bounds,
        ])
        .setup(|_app| {
            #[cfg(debug_assertions)]
            {
                use tauri::Manager;
                let window = _app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
