// filesystem_demo.js
// This script demonstrates the capabilities of the filesystem MCP server

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Allowed directory - same as configured in the MCP server
const ALLOWED_DIR = '/home/ubuntu/projects/homelab';

// Function to list allowed directories (similar to list_allowed_directories tool)
function listAllowedDirectories() {
  console.log('Allowed directories:');
  console.log(`- ${ALLOWED_DIR}`);
  console.log();
}

// Function to list directory contents (similar to list_directory tool)
async function listDirectory(dirPath) {
  try {
    // Ensure the path is within the allowed directory
    const fullPath = path.resolve(ALLOWED_DIR, dirPath);
    if (!fullPath.startsWith(ALLOWED_DIR)) {
      throw new Error(`Access denied: ${dirPath} is outside the allowed directory`);
    }

    const files = await readdir(fullPath);
    console.log(`Contents of ${dirPath}:`);
    
    for (const file of files) {
      const filePath = path.join(fullPath, file);
      const stats = await stat(filePath);
      const prefix = stats.isDirectory() ? '[DIR]' : '[FILE]';
      console.log(`${prefix} ${file}`);
    }
    console.log();
  } catch (error) {
    console.error(`Error listing directory: ${error.message}`);
  }
}

// Function to read a file (similar to read_file tool)
async function readFileContent(filePath) {
  try {
    // Ensure the path is within the allowed directory
    const fullPath = path.resolve(ALLOWED_DIR, filePath);
    if (!fullPath.startsWith(ALLOWED_DIR)) {
      throw new Error(`Access denied: ${filePath} is outside the allowed directory`);
    }

    const content = await readFile(fullPath, 'utf8');
    console.log(`Contents of ${filePath}:`);
    console.log('-----------------------------------');
    console.log(content);
    console.log('-----------------------------------');
    console.log();
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
  }
}

// Function to write to a file (similar to write_file tool)
async function writeFileContent(filePath, content) {
  try {
    // Ensure the path is within the allowed directory
    const fullPath = path.resolve(ALLOWED_DIR, filePath);
    if (!fullPath.startsWith(ALLOWED_DIR)) {
      throw new Error(`Access denied: ${filePath} is outside the allowed directory`);
    }

    // Create directory if it doesn't exist
    const dir = path.dirname(fullPath);
    await mkdir(dir, { recursive: true });

    await writeFile(fullPath, content);
    console.log(`Successfully wrote to ${filePath}`);
    console.log();
  } catch (error) {
    console.error(`Error writing file: ${error.message}`);
  }
}

// Function to get file info (similar to get_file_info tool)
async function getFileInfo(filePath) {
  try {
    // Ensure the path is within the allowed directory
    const fullPath = path.resolve(ALLOWED_DIR, filePath);
    if (!fullPath.startsWith(ALLOWED_DIR)) {
      throw new Error(`Access denied: ${filePath} is outside the allowed directory`);
    }

    const stats = await stat(fullPath);
    console.log(`File information for ${filePath}:`);
    console.log(`- Size: ${stats.size} bytes`);
    console.log(`- Created: ${stats.birthtime}`);
    console.log(`- Modified: ${stats.mtime}`);
    console.log(`- Accessed: ${stats.atime}`);
    console.log(`- Type: ${stats.isDirectory() ? 'directory' : 'file'}`);
    console.log(`- Permissions: ${stats.mode.toString(8).slice(-3)}`);
    console.log();
  } catch (error) {
    console.error(`Error getting file info: ${error.message}`);
  }
}

// Main function to demonstrate all capabilities
async function main() {
  console.log('Filesystem MCP Server Capabilities Demo');
  console.log('======================================');
  console.log();

  // Demonstrate list_allowed_directories
  listAllowedDirectories();

  // Demonstrate list_directory
  await listDirectory('.');
  
  // Demonstrate read_file
  await readFileContent('README.md');
  
  // Demonstrate get_file_info
  await getFileInfo('README.md');
  
  // Demonstrate write_file
  const testContent = 'This is a test file created by the filesystem demo script.\n' +
                     'It demonstrates the write_file capability of the MCP server.\n' +
                     'Created at: ' + new Date().toISOString();
  
  await writeFileContent('mcp_demo/test_file.txt', testContent);
  
  // Verify the file was written by reading it back
  await readFileContent('mcp_demo/test_file.txt');
  
  // Get info about the newly created file
  await getFileInfo('mcp_demo/test_file.txt');
}

// Run the demo
main().catch(console.error);
