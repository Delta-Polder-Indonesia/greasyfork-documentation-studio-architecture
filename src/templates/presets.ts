export interface TemplatePreset {
  id: string;
  name: string;
  markdown: string;
}

export const templatePresets: TemplatePreset[] = [
  {
    id: "readme",
    name: "README",
    markdown: `# Script Name\n\nDeskripsi singkat script untuk GreasyFork.\n\n## Features\n- Feature utama\n- Integrasi halaman target\n- Pengaturan fleksibel\n\n## Installation\n1. Buka halaman script\n2. Klik Install\n3. Refresh halaman target\n\n## Usage\nJelaskan cara penggunaan script secara ringkas.`,
  },
  {
    id: "changelog",
    name: "Changelog",
    markdown: `# Changelog\n\n## 1.1.0\n- Menambah fitur baru\n- Optimasi performa\n\n## 1.0.1\n- Perbaikan bug minor\n\n## 1.0.0\n- Initial release`,
  },
  {
    id: "faq",
    name: "FAQ",
    markdown: `# FAQ\n\n## Apakah script ini aman?\nYa, script hanya berjalan pada domain yang ditargetkan.\n\n## Kenapa fitur tidak muncul?\nPastikan script aktif di Tampermonkey dan halaman sudah di-refresh.\n\n## Bagaimana lapor bug?\nBuat issue dengan langkah reproduksi dan screenshot.`,
  },
  {
    id: "installation-guide",
    name: "Installation Guide",
    markdown: `# Installation Guide\n\n## Requirement\n- Browser modern\n- Tampermonkey\n\n## Steps\n1. Install Tampermonkey\n2. Buka halaman script GreasyFork\n3. Klik Install this script\n4. Konfirmasi instalasi\n\n## Verification\n- Cek script status: Enabled\n- Refresh halaman target`,
  },
  {
    id: "shortcut-table",
    name: "Keyboard Shortcut Table",
    markdown: `# Keyboard Shortcuts\n\n| Shortcut | Action |\n| --- | --- |\n| Ctrl/Cmd + Z | Undo |\n| Ctrl/Cmd + Shift + Z | Redo |\n| Ctrl/Cmd + Y | Redo |\n| Ctrl/Cmd + / | Open shortcuts |`,
  },
  {
    id: "feature-showcase",
    name: "Feature Showcase",
    markdown: `# Feature Showcase\n\n## Smart Selector\nPemilihan elemen otomatis berdasarkan konteks halaman.\n\n## Fast Action\nEksekusi action utama dengan satu klik.\n\n## Configurable\nDukungan konfigurasi melalui menu script.`,
  },
  {
    id: "screenshot-gallery",
    name: "Screenshot Gallery",
    markdown: `# Screenshot Gallery\n\n<img src="https://example.com/screenshot-1.png" alt="Main UI" width="900">\n\n<img src="https://example.com/screenshot-2.png" alt="Settings" width="900">\n\n<img src="https://example.com/screenshot-3.png" alt="Preview" width="900">`,
  },
  {
    id: "youtube-embed",
    name: "YouTube Embed",
    markdown: `# Demo Video\n\n<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="760" height="428" frameborder="0" allowfullscreen></iframe>`,
  },
  {
    id: "warning-box",
    name: "Warning Box",
    markdown: `# Important Warning\n\n<blockquote>\n<strong>Warning:</strong> Gunakan script ini hanya pada domain yang disebutkan pada dokumentasi.\n</blockquote>`,
  },
  {
    id: "info-box",
    name: "Info Box",
    markdown: `# Info\n\n<details open>\n<summary>Read this before install</summary>\n<p>Pastikan browser sudah mengizinkan ekstensi berjalan pada situs target.</p>\n</details>`,
  },
];
