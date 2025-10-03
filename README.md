# Plote - Personal Academic Homepage & Notes

This is a personal academic homepage built with Next.js. It showcases academic background, research interests, and includes a note-taking system that supports Markdown and KaTeX for mathematical formulas.

![Homepage Screenshot](public/img/1.jpg)

## ✨ Key Features

- **🚀 High-Performance Framework**: Built with **Next.js 15** and **React 19**, featuring **Turbopack** for blazing-fast development.
- **🎨 Modern Design**: A sleek, dark theme using **Tailwind CSS** with a "glassmorphism" effect (semi-transparent, blurred backgrounds).
- **☁️ Dynamic Word Cloud**: The hero section features a dynamic word cloud built with **Framer Motion**, showcasing core research areas with smooth animations and interactions.
- **✍️ Markdown Blog/Notes**: An integrated file-based note-taking system that reads Markdown files directly from the `_notes` directory.
- **➗ KaTeX Math Support**: Flawless rendering of mathematical formulas written in LaTeX syntax within your notes.
- **📜 Smooth Animations**: The entire site is enriched with **Framer Motion** for scroll-triggered animations and fluid user interactions.
- **📦 Type-Safe**: Fully written in **TypeScript** for robust and maintainable code.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Markdown Processing**: [Unified](https://unifiedjs.com/), [Remark](https://remark.js.org/), [Rehype](https://rehype.js.org/)
- **Math Formulas**: [KaTeX](https://katex.org/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/neptune-T/aca-web-html.git
    cd aca-web-html
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    This project uses Turbopack for rapid development.
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:3000` in your browser to see the result.

## 📝 Content Management

### Adding a New Note

1.  Create a new `.md` file in the `_notes` directory (e.g., `new-note.md`).
2.  Add `frontmatter` at the top of the file, including `title`, `date`, and `summary`.

    ```markdown
    ---
    title: "My New Note"
    date: "2024-07-30"
    summary: "A short summary of this note."
    ---

    Here is the main content of the note. You can use Markdown syntax and even write math formulas like $E=mc^2$.
    ```

3.  Save the file, and it will automatically appear in the notes list.


