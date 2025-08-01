#!/bin/bash

# JIRA Transition Blocker - Package Script
# This script packages the Chrome extension for distribution as a CRX file

set -e  # Exit on any error

# Configuration
EXTENSION_NAME="jira-transition-blocker"
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)
PACKAGE_DIR="dist"
ZIP_FILE="jira-transition-blocker.zip"
CRX_FILE="extension.crx"

echo "🚗 Packaging JIRA Transition Blocker v${VERSION}"

# Check if PRIVATE_KEY environment variable is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is not set!"
    echo "   Please set the PRIVATE_KEY environment variable with your private key content:"
    echo "   export PRIVATE_KEY=\$(cat extension-key.pem)"
    exit 1
fi

# Clean previous builds
if [ -d "$PACKAGE_DIR" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf "$PACKAGE_DIR"
fi

# Remove previous CRX file if it exists
if [ -f "$CRX_FILE" ]; then
    echo "🧹 Removing previous CRX file..."
    rm -f "$CRX_FILE"
fi

# Create package directory
echo "📁 Creating package directory..."
mkdir -p "$PACKAGE_DIR"

# Copy extension files
echo "📋 Copying extension files..."
cp manifest.json "$PACKAGE_DIR/"
cp background.js "$PACKAGE_DIR/"
cp popup.html "$PACKAGE_DIR/"
cp popup.js "$PACKAGE_DIR/"
cp rules.json "$PACKAGE_DIR/"
cp extension-icon.png "$PACKAGE_DIR/"
cp README.md "$PACKAGE_DIR/"

# Create zip file (required for CRX creation)
echo "📦 Creating temporary zip package..."
cd "$PACKAGE_DIR"
zip -r "../$ZIP_FILE" . -x "*.DS_Store" "*/.DS_Store"
cd ..

# Create CRX file using Chrome's crx tool
echo "🔐 Creating CRX package with private key..."
if command -v crx &> /dev/null; then
    # Write private key from environment variable to temporary file
    echo "$PRIVATE_KEY" > temp_private_key.pem
    
    # Use crx tool with the temporary key file
    crx pack "$PACKAGE_DIR" -p "temp_private_key.pem" -o "$CRX_FILE"
    
    # Clean up temporary key file
    rm -f temp_private_key.pem
else
    echo "❌ Error: 'crx' tool not found!"
    echo "   Please install the 'crx' tool to create CRX files: npm install -g crx"
    exit 1
fi


# Keep the package directory for unpacked loading
echo "📁 Package directory kept for unpacked loading: $PACKAGE_DIR"
rm -f "$ZIP_FILE"

# Update the version in updates.xml from manifest.json

# Extract version from manifest.json
MANIFEST_VERSION=$(grep '"version"' manifest.json | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')

if [ -z "$MANIFEST_VERSION" ]; then
    echo "❌ Error: Could not extract version from manifest.json"
    exit 1
fi

# Update the version attribute in updates.xml
if [ -f updates.xml ]; then
    # Use sed to replace the version attribute in the updatecheck tag
    sed -i.bak -E "s/(<updatecheck[^>]*version=')[^']*'/\1$MANIFEST_VERSION'/" updates.xml
    rm -f updates.xml.bak
    echo "🔄 Updated updates.xml to version $MANIFEST_VERSION"
else
    echo "⚠️  Warning: updates.xml not found, skipping version update."
fi


# Display results
echo ""
if [ -f "$CRX_FILE" ]; then
    echo "✅ CRX package created successfully!"
    echo "📦 Package: $CRX_FILE"
    echo "📏 Size: $(du -h "$CRX_FILE" | cut -f1)"
else
    echo "⚠️  CRX package could not be created, but ZIP file was available"
    echo "   Please ensure Chrome/Chromium is installed or use the 'crx' tool."
fi 
