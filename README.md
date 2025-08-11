# TapMath - The Tree of Mathematics 

A visual and interactive website that teaches math concepts to K-9 students using a tree metaphor, where students start with foundational concepts (roots) and progressively advance to more complex topics (branches).

## 🌳 Tree Structure

### Roots (Grades K-2) - Foundation Concepts
- **Counting & Numbers** - Number recognition and counting to 100
- **Basic Shapes** - Identifying geometric shapes
- **Simple Addition** - Adding numbers up to 10
- **Simple Subtraction** - Subtracting numbers up to 10
- **Patterns & Sequences** - Recognizing and creating patterns
- **Introduction to Measurement** - Comparing sizes and basic measurement

### Trunk (Grades 3-5) - Core Skills
- **Place Value** - Understanding tens, ones, and hundreds
- **Introduction to Multiplication** - Multiplication as repeated addition
- **Introduction to Division** - Division as sharing equally
- **Basic Fractions** - Understanding parts of a whole
- **2D Geometry** - Properties of 2D shapes and angles
- **Introduction to Decimals** - Decimal notation and place value
- **Data & Graphs** - Reading and creating simple graphs
- **Area & Perimeter** - Calculating area and perimeter of rectangles

### Branches (Grades 6-9) - Advanced Concepts
- **Advanced Fractions** - Operations with fractions and mixed numbers
- **Integers & Negative Numbers** - Working with positive and negative numbers
- **Ratios & Proportions** - Understanding relationships between quantities
- **Percentages** - Converting between fractions, decimals, and percentages
- **Introduction to Algebra** - Basic algebraic thinking and simple equations
- **3D Geometry** - Volume and surface area of 3D shapes
- **Probability** - Basic probability concepts and calculations
- **Statistics** - Mean, median, mode and data analysis
- **Coordinate Plane** - Plotting points and graphing
- **Linear Equations** - Solving and graphing linear equations

## 🎯 Features

### Progressive Learning System
- **Unlock System**: Students must complete concepts in lower levels before advancing
- **Progress Tracking**: Visual progress indicators for each tree section
- **Local Storage**: Progress is saved locally in the browser

### Interactive Elements
- **Video Integration**: Each concept includes educational YouTube videos
- **Modal Interface**: Detailed concept information in beautiful modal windows
- **Visual Feedback**: Hover effects, animations, and status indicators
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Educational Design
- **Kid-Friendly UI**: Colorful, engaging design with fun fonts and icons
- **Clear Structure**: Each concept shows grade level, duration, and topics covered
- **Accessibility**: Focus indicators and keyboard navigation support

## 📁 File Structure

```
tapmath-website/
├── index.html              # Main HTML structure
├── styles.css              # CSS styling and animations
├── app.js                  # JavaScript functionality
├── tree-structure.json     # Tree layer configuration
├── math-concepts.json      # Concept data with video URLs
└── README.md               # Documentation
```

## 🚀 Getting Started

1. **Clone or download** the project files to your local machine
2. **Open `index.html`** in a web browser
3. **Start learning!** Click on any available concept in the Roots section

## 💾 Data Structure

### Tree Structure JSON
Controls the overall tree organization:
- Layer definitions (roots, trunk, branches)
- Grade levels and descriptions
- Visual styling information
- Progression rules

### Math Concepts JSON
Contains all educational content:
- Concept titles and descriptions
- YouTube video URLs
- Grade levels and durations
- Learning topics for each concept

## 🎨 Customization

### Adding New Concepts
1. Edit `math-concepts.json`
2. Add new concept objects with required fields:
   - `id`, `title`, `description`
   - `gradeLevel`, `videoUrl`, `duration`
   - `topics` array

### Changing Tree Structure
1. Edit `tree-structure.json`
2. Modify layer properties or add new layers
3. Update CSS classes in `styles.css` if needed

### Styling Changes
- Edit `styles.css` for visual modifications
- Color schemes are defined per tree section
- Responsive breakpoints at 768px and 480px

## 🔧 Technical Details

### Browser Compatibility
- Modern browsers with ES6+ support
- Local Storage for progress tracking
- Responsive CSS Grid and Flexbox

### Performance
- Lazy loading of video content
- Efficient DOM manipulation
- Optimized CSS animations

### Dependencies
- No external JavaScript libraries
- Google Fonts (Fredoka One, Comic Neue)
- YouTube iframe API for video embedding

## 📱 Responsive Design

The website adapts to different screen sizes:
- **Desktop**: Full grid layout with hover effects
- **Tablet**: Adjusted grid and modal sizing
- **Mobile**: Single column layout with touch-friendly controls

## 🎓 Educational Philosophy

The tree metaphor reinforces the concept that:
- **Strong foundations** (roots) are essential
- **Core skills** (trunk) build upon foundations
- **Advanced concepts** (branches) grow from strong cores
- **Progressive learning** ensures proper skill development

## 🔮 Future Enhancements

Potential additions for future versions:
- User accounts and cloud sync
- Gamification with badges and rewards
- Interactive exercises and quizzes
- Teacher dashboard and class management
- Additional content areas (science, language arts)
- Offline capability with Service Workers

## 📝 License

This educational project is designed for learning purposes. Video content is linked from educational YouTube channels - please respect their individual licensing terms.

