# MimicBento 🍱

A sleek and customizable portfolio engine inspired by bento.me. This experimental project reimagines the elegant bento box-style layout with a fully flexible block system.

## ✨ Features

- **🎨 Beautiful Bento Grid Layout** - Elegant portfolio presentation with customizable block sizes
- **📱 Responsive Design** - Seamless experience on desktop and mobile devices
- **🔧 Admin Dashboard** - Live editing with drag-and-drop functionality
- **🧩 Extensible Block System** - 15+ field types, custom validation, and plugin architecture
- **🎯 Modern UI** - Clean design with React icons and smooth animations
- **📸 File Upload** - Integrated image upload with preview functionality
- **🎭 Block Types** - Clock, Social, Photo, Video, Music, Map, Note, Link, and custom blocks

## 🚀 Block System

This project features a **complete extensible block system** that allows others to create custom blocks without modifying core code:

## 📋  Deafult Blocks

- **📝 Note Block** - Text content and memos
- **🔗 Link Block** - External links with descriptions
- **📷 Photo Block** - Images with upload functionality
- **🎥 Video Block** - Video content and embeds
- **🎵 Music Block** - Music tracks and audio content
- **🕐 Clock Block** - Live time display with timezone support
- **🗺️ Map Block** - Location display with address
- **👤 Social Block** - Social media profile links
- **📋 Section Header** - Organize content with headers

## 📏 Available Block Sizes

The bento grid system supports multiple block sizes for flexible layouts:

- **`small`** - 1×1 grid cell (175px × 175px) - Perfect for icons, social links, small widgets
- **`medium`** - 1×2 grid cells (175px × 370px) - Good for photos, longer content
- **`large`** - 2×2 grid cells (370px × 370px) - Ideal for featured content, large images
- **`wide`** - 2×1 grid cells (370px × 175px) - Great for links, horizontal content
- **`tall`** - 1×3 grid cells (175px × 565px) - Perfect for vertical lists, tall images
- **`section-header`** - Full width header - For organizing content into sections (width 60px)

Default Grid Layout by screensize
- **`4 x n`** - Desktop 
- **`2 x n`** - Mobile devices


Blocks can be resized in admin mode using the drag handles on photo blocks.

### Creating Custom Blocks

See the [Block Development Guide](./BLOCK_DEVELOPMENT.md) for detailed instructions on creating custom blocks.


## 🔒 Admin Security

Currently, we do not have an authorization system in place for the admin panel. To ensure security, the admin panel and all write operations are  **automatically restricted to development environment only**

### Environment Restrictions:

**Admin Access** (`/admin`):
- ✅ **Development**: Full access (`NODE_ENV === 'development'`)
- ✅ **Manual Override**: Can be enabled with `NEXT_PUBLIC_ENABLE_ADMIN=true`
- ❌ **Production**: Automatically returns 404 (not found)

**API Write Operations** (`POST/PUT /api/portfolio`):
- ✅ **Development**: Full read/write access (`NODE_ENV === 'development'`)
- ✅ **Manual Override**: Can be enabled with `ENABLE_ADMIN=true`
- ✅ **Production Read**: `GET /api/portfolio` always works (for viewing)
- ❌ **Production Write**: Returns 403 Forbidden for POST/PUT operations

This means the site is **production-safe by default** - visitors can view your portfolio, but cannot edit it unless explicitly enabled.


## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mimicbento
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the portfolio

5. Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin) to edit content


**Note**: This is an experimental project created for learning and demonstration purposes.
