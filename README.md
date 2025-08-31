# Redirectinator v2.0

A professional-grade, client-side web application for bulk URL redirect analysis and monitoring. Built for SEO professionals who need to validate redirect chains without server infrastructure costs.

![Redirectinator Dashboard](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### Core Functionality
- **Client-side Processing**: All URL checking runs in your browser
- **Bulk Analysis**: Handle thousands of URLs efficiently
- **Real-time Progress**: Live processing indicators and progress tracking
- **Comprehensive Analysis**: Full redirect chain tracking, loop detection, performance metrics
- **Target Validation**: Confirm URLs redirect to expected destinations

### Input Methods
- **Single URL Entry**: Manual input with BaseURL and TargetURL fields
- **Bulk CSV Upload**: Upload files with Starting URL and Target Redirect columns
- **Copy/Paste Interface**: Textarea for multiple URLs in CSV format
- **Authentication Support**: Username/password for staging sites

### Analysis & Results
- **Full Redirect Chain Tracking**: Complete path from start to finish
- **Loop Detection**: Identifies infinite redirect loops
- **Mixed Type Detection**: Flags chains with multiple redirect types
- **Performance Metrics**: Response times and performance impact
- **Domain Analysis**: Tracks domain changes and HTTPS upgrades
- **Comprehensive Status Codes**: Full HTTP status analysis

### Data Management
- **Local Storage**: IndexedDB for large datasets (GBs capacity)
- **Project Organization**: Multiple saved projects per user
- **Auto-save**: Continuous progress saving
- **Export Options**: CSV, JSON, Excel, and Markdown reports
- **Import/Export**: Share projects between users

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Storage**: IndexedDB (via idb library)
- **Icons**: Lucide React
- **CSV Processing**: PapaParse
- **File Downloads**: FileSaver.js

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/techseo/redirectinator.git
cd redirectinator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production
```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

## 🎯 Usage

### Getting Started
1. **Create a Project**: Start by creating a new project in the Projects tab
2. **Add URLs**: Use any of the input methods to add URLs for analysis
3. **Process URLs**: Click "Process URLs" to start the analysis
4. **Review Results**: View detailed results in the comprehensive table
5. **Export Data**: Download results in various formats

### Input Formats

#### Single URL
- **Starting URL**: `http://example.com`
- **Target Redirect**: `https://example.com`

#### CSV Format
```csv
Starting URL,Target Redirect
http://example.com,https://example.com
http://test.com,https://test.com
```

#### Bulk Text
```
http://example.com,https://example.com
http://test.com,https://test.com
```

### Results Analysis

The application provides comprehensive analysis including:

- **Result Status**: Direct, Redirect, Error, or Loop
- **HTTP Status Chain**: Complete redirect chain (e.g., "301 → 200")
- **Performance Metrics**: Response times and redirect counts
- **Security Analysis**: Loop detection, mixed redirect types
- **Domain Analysis**: Cross-domain redirects and HTTPS upgrades

## 🔧 Configuration

### Settings
- **Batch Size**: Number of URLs to process simultaneously (1-100)
- **Delay Between Requests**: Milliseconds between requests (0-5000ms)
- **Timeout**: Request timeout in milliseconds (1000-30000ms)
- **Auto-save**: Automatic project saving
- **Theme**: Light, Dark, or Auto (system preference)

### Advanced Options
- **Authentication**: Username/password for protected staging sites
- **Max Redirects**: Maximum redirect chain length (default: 10)
- **Include Headers**: Additional HTTP header analysis

## 📊 Export Options

### Available Formats
- **CSV**: Standard spreadsheet format
- **JSON**: Machine-readable format with metadata
- **Excel**: Formatted for spreadsheet applications
- **Markdown Report**: Professional analysis report

### Export Features
- **Filtered Exports**: Export only specific result types
- **Custom Headers**: Include/exclude column headers
- **Metadata**: Export includes analysis metadata and timestamps

## 🔒 Privacy & Security

### Client-side Processing
- All URL checking happens in your browser
- No data is sent to external servers
- Complete privacy and data control

### Local Storage
- All data stored locally using IndexedDB
- No database costs or server infrastructure
- Data never leaves your device

### CORS Handling
- Graceful fallback for blocked requests
- Clear error reporting for CORS issues
- Support for authentication headers

## 🚀 Performance

### Scalability
- **Memory Management**: Intelligent chunking prevents browser crashes
- **Batch Processing**: Configurable batch sizes for optimal performance
- **Progress Tracking**: Real-time updates during processing
- **Pause/Resume**: Interrupt and continue long-running processes

### Optimization
- **Virtualized Rendering**: Only display visible table rows
- **Lazy Loading**: Progressive result loading
- **Resource Monitoring**: Track browser memory usage
- **Auto-optimization**: Adjust batch sizes based on performance

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Header.tsx      # Application header
│   ├── Dashboard.tsx   # Main dashboard
│   ├── UrlInput.tsx    # URL input interface
│   ├── ResultsTable.tsx # Results display
│   ├── ProjectManager.tsx # Project management
│   ├── Settings.tsx    # Application settings
│   └── NotificationProvider.tsx # Toast notifications
├── services/           # Business logic
│   ├── redirectChecker.ts # URL analysis engine
│   ├── storage.ts      # IndexedDB storage
│   └── exportService.ts # Export functionality
├── types/              # TypeScript definitions
│   └── index.ts        # Application types
└── main.tsx           # Application entry point
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📈 Roadmap

### Phase 1 (Current) - Core Functionality ✅
- [x] Basic URL input (single + bulk CSV)
- [x] Core redirect checking with full analysis
- [x] Results table with all specified metrics
- [x] Local storage and project persistence
- [x] CSV export functionality
- [x] Real-time progress tracking

### Phase 2 - Scale & Performance
- [ ] Web Workers for background processing
- [ ] Advanced memory management
- [ ] Pause/resume functionality
- [ ] Search and filtering improvements
- [ ] Bulk operations

### Phase 3 - Professional Features
- [ ] Project templates and organization
- [ ] Advanced export formats
- [ ] Data validation and cleanup
- [ ] Performance optimization tools
- [ ] Enterprise-ready features

### Phase 4 - Enhancement & Growth
- [ ] API integrations
- [ ] Advanced analytics and reporting
- [ ] Collaboration features
- [ ] White-label options
- [ ] Premium feature set

## 🤝 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Reference](docs/api-reference.md)
- [Troubleshooting](docs/troubleshooting.md)

### Community
- [GitHub Issues](https://github.com/techseo/redirectinator/issues)
- [Discussions](https://github.com/techseo/redirectinator/discussions)
- [Wiki](https://github.com/techseo/redirectinator/wiki)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the Tech SEO team
- Inspired by the need for cost-effective, privacy-focused SEO tools
- Powered by modern web technologies and best practices

---

**Redirectinator v2.0** - Professional URL redirect analysis, now client-side and cost-free.
