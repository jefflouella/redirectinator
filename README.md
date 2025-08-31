# 🔄 Redirectinator

**Professional URL redirect checker and monitoring tool for SEO professionals and technical marketers.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

## ✨ Features

### 🚀 Core Functionality
- **Bulk URL Analysis**: Process hundreds of URLs simultaneously with intelligent batching
- **Real-time Processing**: Live progress tracking with stop/resume capabilities
- **Historical Discovery**: Find historical URLs via Internet Archive integration
- **Export Capabilities**: Export results in CSV, JSON, Excel, and detailed reports
- **Project Management**: Organize and manage multiple projects with collaboration features

### 🛠 Technical Features
- **Client-side Processing**: Fast, secure processing directly in your browser
- **Server-side Fallback**: Advanced redirect checking with Puppeteer backend
- **Local Data Storage**: All data stored locally using IndexedDB
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI/UX**: Clean, professional interface with dark/light themes

### 📊 Analysis Capabilities
- **Redirect Chain Tracking**: Follow complete redirect chains up to 10 levels deep
- **Status Code Analysis**: Detailed HTTP status code reporting
- **Response Time Metrics**: Performance analysis for each URL
- **Final Destination Mapping**: Track where each URL ultimately leads
- **Error Detection**: Identify broken links and server issues

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jefflouella/redirectinator.git
   cd redirectinator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Start the backend server** (optional, for advanced features)
   ```bash
   npm run server
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Usage

### Basic URL Analysis
1. Navigate to the **Dashboard** tab
2. Enter URLs in the input field (one per line or bulk import)
3. Configure processing options (timeout, max redirects, etc.)
4. Click **Start Processing** to begin analysis
5. Monitor real-time progress and results
6. Export results in your preferred format

### Historical URL Discovery
1. Go to the **Wayback Discovery** tab
2. Enter a domain or specific URL
3. Set date range for historical snapshots
4. Discover and analyze historical URLs
5. Export findings for further analysis

### Project Management
1. Create new projects in the **Projects** tab
2. Organize URLs by project or client
3. Share results with team members
4. Track progress across multiple campaigns

## 🏗 Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Lucide React** for consistent icons
- **IndexedDB** for local data persistence

### Backend (Optional)
- **Express.js** server for advanced processing
- **Puppeteer** for complex redirect analysis
- **CORS** enabled for cross-origin requests
- **Proxy support** for development

### Data Flow
```
URL Input → Processing Queue → Analysis Engine → Results Storage → Export
     ↓              ↓              ↓              ↓              ↓
  Validation    Batching      Client/Server    IndexedDB    CSV/JSON/Excel
```

## 🔧 Configuration

### Processing Options
- **Timeout**: Set request timeout (default: 30 seconds)
- **Max Redirects**: Limit redirect chain depth (default: 10)
- **Batch Size**: Control concurrent requests (default: 5)
- **User Agent**: Customize request headers
- **Follow Redirects**: Enable/disable redirect following

### Export Options
- **CSV**: Standard spreadsheet format
- **JSON**: Structured data format
- **Excel**: Advanced spreadsheet with formatting
- **Detailed Report**: Comprehensive analysis document

## 📁 Project Structure

```
redirectinator/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Footer.tsx       # Application footer
│   │   ├── AboutPage.tsx    # About page
│   │   ├── PrivacyPage.tsx  # Privacy policy
│   │   └── TermsPage.tsx    # Terms & conditions
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Business logic services
│   ├── types/               # TypeScript type definitions
│   └── main.tsx            # Application entry point
├── server.js               # Express backend server
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🛠 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run server       # Start backend server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Code Quality
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **React Strict Mode** enabled

## 🌟 Key Features in Detail

### Intelligent Batching
- Automatically batches URLs for optimal performance
- Configurable batch sizes based on server capacity
- Progress tracking for each batch
- Error handling with retry logic

### Historical Analysis
- Integration with Internet Archive Wayback Machine
- Date range selection for historical snapshots
- Bulk historical URL discovery
- Export historical findings

### Export Capabilities
- **CSV Export**: Standard spreadsheet format with all data
- **JSON Export**: Structured data for API integration
- **Excel Export**: Advanced formatting with multiple sheets
- **Detailed Reports**: Comprehensive analysis documents

### Project Management
- Create and manage multiple projects
- Organize URLs by client or campaign
- Share results with team members
- Track progress across projects

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Creator

**Jeff Louella** - [Website](https://www.jefflouella.com) | [GitHub](https://github.com/jefflouella)

Redirectinator was created to solve real-world SEO challenges and provide professionals with the tools they need for comprehensive URL analysis and monitoring.

## 🙏 Acknowledgments

- **Internet Archive** for historical URL data
- **React Team** for the amazing framework
- **Vite Team** for the fast build tool
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icons

## 📞 Support

- **Documentation**: Check the [Wiki](https://github.com/jefflouella/redirectinator/wiki)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/jefflouella/redirectinator/issues)
- **Discussions**: Join the conversation on [GitHub Discussions](https://github.com/jefflouella/redirectinator/discussions)
- **Email**: Contact at [support@redirectinator.com](mailto:support@redirectinator.com)

---

**Made with ❤️ by Jeff Louella**

*Professional URL analysis tools for the modern web.*
