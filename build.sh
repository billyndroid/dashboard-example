#!/bin/bash

# Build script for dashboard-example
# This script minifies CSS and JavaScript files for production

echo "🚀 Starting build process..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create dist directory
echo "📁 Creating dist directory..."
mkdir -p dist/styles dist/scripts

# Minify CSS
echo "🎨 Minifying CSS..."
npx clean-css-cli styles/style.css -o dist/styles/style.min.css
npx clean-css-cli styles/glass-card.css -o dist/styles/glass-card.min.css

# Minify JavaScript files individually (for debugging)
echo "📜 Minifying JavaScript files..."
for file in scripts/*.js; do
    filename=$(basename "$file" .js)
    npx terser "$file" -o "dist/scripts/${filename}.min.js" --compress --mangle --source-map
done

# Create bundled version
echo "📦 Creating JavaScript bundle..."
npx terser scripts/*.js -o dist/scripts/bundle.min.js --compress --mangle

# Calculate sizes
echo ""
echo "📊 Build Results:"
echo "----------------------------------------"

# CSS sizes
css_original=$(wc -c < styles/style.css | tr -d ' ')
css_minified=$(wc -c < dist/styles/style.min.css | tr -d ' ')
css_reduction=$(echo "scale=1; (1 - $css_minified/$css_original) * 100" | bc)

echo "CSS (style.css):"
echo "  Original: ${css_original} bytes"
echo "  Minified: ${css_minified} bytes"
echo "  Reduction: ${css_reduction}%"
echo ""

# JS bundle size
bundle_size=$(wc -c < dist/scripts/bundle.min.js | tr -d ' ')
echo "JavaScript Bundle:"
echo "  Size: ${bundle_size} bytes"
echo ""

echo "✅ Build complete!"
echo "📁 Output directory: dist/"
echo ""
echo "To use minified files, update your HTML:"
echo "  <link rel=\"stylesheet\" href=\"dist/styles/style.min.css\">"
echo "  <script src=\"dist/scripts/bundle.min.js\"></script>"
