# OpenDraw - School Whiteboard Desktop App

<div align="center">

![OpenDraw Logo](https://img.shields.io/badge/OpenDraw-School%20Whiteboard-blue?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri-FFC131?style=for-the-badge&logo=tauri)](https://tauri.app)
[![Powered by React](https://img.shields.io/badge/Powered%20by-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Fork of Excalidraw](https://img.shields.io/badge/Fork%20of-Excalidraw-6965db?style=for-the-badge)](https://github.com/excalidraw/excalidraw)

**A fully offline, privacy-focused desktop whiteboard application for schools and educators**

**Forked from [Excalidraw](https://github.com/excalidraw/excalidraw)**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Development](#development) • [Building](#building)

</div>

---

## 📖 About

OpenDraw is a **completely offline** desktop whiteboard application built with Tauri, designed specifically for schools and educational environments. It provides a powerful, privacy-respecting drawing and collaboration tool that works entirely on your local machine without any internet connection or cloud dependencies.

**This project is a fork of [Excalidraw](https://github.com/excalidraw/excalidraw)**, modified to work completely offline for educational use. We are deeply grateful to the Excalidraw team for creating such an amazing open-source whiteboard tool.

### Why OpenDraw?

- 🔒 **100% Offline** - No internet required, no data sent to external servers
- 🎓 **Education-Focused** - Designed for classroom and teaching scenarios
- 🚀 **Lightweight** - Small binary size, fast startup
- 🖥️ **Cross-Platform** - Works on Windows, macOS, and Linux
- 🎨 **Feature-Rich** - Full drawing tools, shapes, text, and more
- 💾 **Local Storage** - All data saved locally on your device

## ✨ Features

### Core Features
- ✅ **Fully Offline Operation** - No internet connection required
- ✅ **Rich Drawing Tools** - Pen, shapes, text, arrows, and more
- ✅ **Multi-Tab Support** - Work on multiple whiteboards simultaneously
- ✅ **Native File Dialogs** - Save and load `.excalidraw` files
- ✅ **Local Storage** - Automatic saving to browser storage
- ✅ **Export Options** - Export to PNG, SVG, and other formats
- ✅ **Keyboard Shortcuts** - Efficient workflow with hotkeys
- ✅ **Dark/Light Theme** - Comfortable viewing in any environment

### Privacy & Security
- 🔐 No collaboration features (removed for privacy)
- 🔐 No cloud sync or backend connections
- 🔐 No AI features or external API calls
- 🔐 No tracking or analytics in production
- 🔐 All data stays on your local machine

### Technical Features
- ⚡ Fast native performance with Tauri + Rust
- 🎯 Small binary size (~5-10MB)
- 🔄 Auto-update support (optional)
- 🖼️ Custom app icons and branding
- 📦 Easy installation with native installers

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Rust** (required for Tauri)
   ```bash
   # Install Rust from https://rustup.rs/
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Bun** (JavaScript runtime - faster than npm/yarn)
   ```bash
   # Install Bun from https://bun.sh/
   curl -fsSL https://bun.sh/install | bash
   ```

   *Alternatively, you can use npm or yarn if you prefer*

### Quick Start

```bash
# Clone the repository
git clone https://github.com/RakeshChandraMahato/OpenDraw.git
cd OpenDraw/tauri-app

# Install dependencies
bun install

# Run in development mode
bun run tauri:dev

# Build for production
bun run tauri:build
```

## 🎯 Usage

### Running the App

**Development Mode** (with hot-reload):
```bash
bun run tauri:dev
```

**Production Build**:
```bash
bun run tauri:build
```

The built application will be in `src-tauri/target/release/bundle/`

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server only |
| `bun run build` | Build frontend for production |
| `bun run preview` | Preview production build |
| `bun run tauri` | Run Tauri CLI commands |
| `bun run tauri:dev` | Run app in development mode |
| `bun run tauri:build` | Build production app |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New drawing |
| `Ctrl/Cmd + O` | Open file |
| `Ctrl/Cmd + S` | Save file |
| `Ctrl/Cmd + Shift + S` | Save as |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + C` | Copy |
| `Ctrl/Cmd + V` | Paste |
| `Delete` | Delete selected |

## 🛠️ Development

### Project Structure

```
tauri-app/
├── src/                      # React frontend source
│   ├── App.tsx              # Main app component (offline mode)
│   ├── components/          # React components
│   ├── data/                # Data management
│   └── app-language/        # Internationalization
├── packages/                 # Shared packages
│   ├── common/              # Common utilities
│   ├── element/             # Element types
│   ├── excalidraw/          # Core Excalidraw library
│   └── math/                # Math utilities
├── public/                   # Static assets
│   ├── screenshots/         # App screenshots
│   └── *.woff2             # Font files
├── src-tauri/               # Rust/Tauri backend
│   ├── src/
│   │   ├── main.rs         # Tauri entry point
│   │   └── lib.rs          # Rust library code
│   ├── icons/              # Application icons
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── scripts/                 # Build scripts
├── .env.development         # Development environment variables
├── .env.production          # Production environment variables
├── package.json             # Node dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.mts          # Vite configuration
```

### Environment Variables

The app uses environment variables to disable external services:

**`.env.development`** and **`.env.production`**:
```bash
# All backend services disabled for offline mode
VITE_APP_BACKEND_V2_GET_URL=
VITE_APP_BACKEND_V2_POST_URL=
VITE_APP_LIBRARY_URL=
VITE_APP_LIBRARY_BACKEND=
VITE_APP_WS_SERVER_URL=
VITE_APP_PLUS_LP=
VITE_APP_PLUS_APP=
VITE_APP_AI_BACKEND=
VITE_APP_FIREBASE_CONFIG=
```

### Configuration

#### Tauri Configuration (`src-tauri/tauri.conf.json`)

Customize the app by editing:
- **Product name**: `productName`
- **App identifier**: `identifier`
- **Window settings**: `app.windows`
- **Bundle settings**: `bundle`
- **Build commands**: `build`

#### Package Configuration (`package.json`)

- App name: `opendraw-tauri`
- Version: `1.0.0`
- Dependencies and scripts

### Adding Features

1. **Frontend changes**: Edit files in `src/`
2. **Backend changes**: Edit Rust files in `src-tauri/src/`
3. **Configuration**: Update `src-tauri/tauri.conf.json`
4. **Dependencies**: 
   - Frontend: `bun add <package>`
   - Backend: Add to `src-tauri/Cargo.toml`

## 📦 Building

### Build for Production

```bash
bun run tauri:build
```

### Build Outputs

The built application will be in `src-tauri/target/release/bundle/`:

| Platform | Output Files |
|----------|-------------|
| **Windows** | `*.exe` (installer), `*.msi` (MSI installer) |
| **macOS** | `*.dmg` (disk image), `*.app` (application bundle) |
| **Linux** | `*.deb` (Debian), `*.AppImage` (AppImage) |

### Build Options

To build for specific platforms:

```bash
# Build for current platform
bun run tauri:build

# Build with debug info
bun run tauri:build -- --debug

# Build for specific target
bun run tauri:build -- --target <target-triple>
```

### Code Signing (Optional)

For production releases, you may want to sign your application:

- **Windows**: Set `certificateThumbprint` in `tauri.conf.json`
- **macOS**: Configure signing in Xcode or via CLI
- **Linux**: Use `gpg` for signing

## 🔧 Troubleshooting

### Common Issues

#### Rust not found
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

#### Build fails
```bash
# Clean and rebuild
cd src-tauri
cargo clean
cd ..
bun install
bun run tauri:build
```

#### Port already in use
```bash
# Change port in .env.development
VITE_APP_PORT=3001
```

#### Icons missing
Ensure you have all required icon formats in `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

#### Dependencies not installing
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This project would not be possible without the incredible work of:

### Excalidraw Team
**OpenDraw is a fork of [Excalidraw](https://github.com/excalidraw/excalidraw)** - an amazing open-source virtual whiteboard for sketching hand-drawn like diagrams. We are deeply grateful to the Excalidraw team and community for:
- Creating such a powerful and intuitive drawing tool
- Maintaining excellent code quality and documentation
- Building a welcoming open-source community
- Making it possible for projects like OpenDraw to exist

**Original Excalidraw Repository**: https://github.com/excalidraw/excalidraw  
**Excalidraw Website**: https://excalidraw.com

### Other Technologies
- **[Tauri](https://tauri.app/)** - For the lightweight desktop framework
- **[React](https://reactjs.org/)** - For the UI framework
- **[Rust](https://www.rust-lang.org/)** - For the backend performance

## 📞 Contact

**Rakesh Chandra Mahato**

- GitHub: [@RakeshChandraMahato](https://github.com/RakeshChandraMahato)
- Project Link: [https://github.com/RakeshChandraMahato/OpenDraw](https://github.com/RakeshChandraMahato/OpenDraw)

---

<div align="center">

**Built for educators and students**

</div>
