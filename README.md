# CPP Learn — Interactive Modern C++ Course

**Live site:** https://rujankhiuju.github.io/OOP-C-learn/

An interactive C++ learning platform built as a single self-contained HTML file. Features a Codecademy-style split interface with a lesson reader, live code editor, terminal output, and answer validation.

## Curriculum

10 lessons aligned with industry-standard references:

| # | Chapter | C++ Primer (5th Ed.) | LearnCPP.com |
|---|---------|---------------------|--------------|
| 1 | Getting Started | Ch 1 | Ch 0-1 |
| 2 | Variables & Fundamental Types | Ch 2 | Ch 4-5 |
| 3 | Strings, Vectors & Arrays | Ch 3 | Ch 5, 16-17 |
| 4 | Expressions & Operators | Ch 4 | Ch 6 |
| 5 | Control Flow | Ch 5 | Ch 8 |
| 6 | Functions & Overloading | Ch 6 | Ch 11 |
| 7 | Classes & Object-Oriented Design | Ch 7 | Ch 14 |
| 8 | IO Library & File Streams | Ch 8 | Ch 28 |
| 9 | Dynamic Memory & Smart Pointers | Ch 12 | Ch 22 |
| 10 | Templates & The Standard Library | Ch 16 | Ch 11, 26 |

## Features

- **Dark mode interface** with strong contrast and accessible focus states
- **Split-panel learning** — lesson reader on the left, code editor on the right
- **10 interactive lessons** covering C++17/20 features
- **Code execution simulation** with terminal output
- **Answer validation** with per-lesson pattern checks
- **Progress tracking** with visual sidebar indicators
- **Authentication system** — sign up or continue as guest
- **Auto-save** — code is saved per lesson per user
- **Session management** with 24-hour expiry
- **Password security** — SHA-256 hashing with rate limiting
- **Toast notifications** for feedback
- **Responsive design** — works on desktop, tablet, and mobile
- **Keyboard shortcut:** Ctrl+Enter to run code

## Tech Stack

- **Single HTML file** — no dependencies, no build step
- **Vanilla CSS** with CSS custom properties
- **Vanilla JavaScript** (ES6+) with Web Crypto API
- **localStorage/sessionStorage** for persistence

## Usage

1. Open index.html in any modern browser
2. Sign up or continue as a guest
3. Work through 10 lessons from Hello World to Templates
4. Write code in the editor, click **Run** to simulate compilation
5. Click **Check Answer** to validate against key patterns
6. Track progress in the sidebar

## Security

- Passwords hashed with **SHA-256** via Web Crypto API
- Login **rate-limited** to 5 attempts per minute
- **CSP** (Content Security Policy) meta tag
- **Input sanitization** against XSS
- **Session tokens** with 24-hour expiry in sessionStorage

## License

MIT
