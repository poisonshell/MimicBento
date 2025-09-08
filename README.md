# MimicBento 🍱

A sleek and customizable portfolio engine inspired by bento.me. Create beautiful portfolio layouts with a flexible block system and admin interface.

## ✨ Features

- **🎨 Bento Grid Layout** - Elegant portfolio with customizable block sizes
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **🎬 Smooth Animations** - Framer Motion powered animations with scroll triggers
- **🔧 Secure Admin Panel** - Protected editing with authentication
- **🧩 Extensible Blocks** - 10+ block types with plugin architecture
- **📸 File Upload** - Secure image handling with optimization

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Run development server:**
```bash
npm run dev
```

3. **Visit your portfolio:** [http://localhost:3000](http://localhost:3000)
4. **Access admin panel:** [http://localhost:3000/admin](http://localhost:3000/admin)

## 🎬 Animation System

Control your portfolio's visual experience with built-in animations:

- **Page Transitions** - Fade, slide, or scale between pages
- **Block Animations** - FadeUp, scaleIn, slideIn, bounce effects
- **Scroll Triggers** - Blocks animate into view as you scroll
- **Live Controls** - Adjust timing, easing, and effects in admin panel


## 📋 Available Blocks

- **📝 Note** - Text content and memos
- **🔗 Link** - External links with descriptions  
- **📷 Photo** - Images with secure upload
- **🎥 Video** - Video content and embeds
- **🎵 Music** - Music tracks and audio
- **🕐 Clock** - Live time with timezone
- **🗺️ Map** - Location with address
- **👤 Social** - Social media links
- **� Git Activity** - GitHub contribution graphs and stats
- **�📋 Header** - Section organization

## 🎯 Block Sizes

- **Small** (1×1) - Icons, social links
- **Medium** (1×2) - Photos, content
- **Large** (2×2) - Featured content
- **Wide** (2×1) - Links, horizontal layout
- **Extra Wide** (4×1) - Spanning headers, banners
- **Tall** (1×3) - Lists, vertical content

## 🚀 Production Deployment

**Essential Environment Variables:**
```bash
# Required for admin access
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_ENABLE_ADMIN=true

# Admin password
# Use encoded format due to Next.js parsing issues with $ characters
ADMIN_PASSWORD_HASH_ENCODED=

# Optional: Google Maps for location blocks
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
```

**Important:** To change the admin password, see `.env.example` for hash generation instructions.

**Security by Default:**
- Admin panel disabled in production unless explicitly enabled
- All write operations require authentication
- Automatic file cleanup and security monitoring

## 🧹 File Management

**Automatic Cleanup Upload:**
- **Safe Detection:** Files must be BOTH unused (not referenced anywhere) AND old (30+ days)
- **Background Process:** Runs weekly for maintenance
- **Manual Control:** Use `GET/POST /api/admin/cleanup` for manual management

## 🛠️ Development

See [Block Development Guide](./BLOCK_DEVELOPMENT.md) for creating custom blocks.
