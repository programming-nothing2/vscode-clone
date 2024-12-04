// Initialize file storage
let files = JSON.parse(localStorage.getItem("files")) || {};

// DOM elements
const fileExplorer = document.getElementById("file-explorer");
const codeEditor = document.getElementById("code-editor");
const downloadBtn = document.getElementById("download-all");

// Currently opened file name
let currentFileName = null;
let isFileUnsaved = false; // Track whether the file is unsaved

function showFileName(currentFileName){
  document.getElementById("file-name").innerHTML = currentFileName;
}

// Load files into the file explorer
function loadFiles() {
  showFileName(currentFileName);
  fileExplorer.innerHTML = ""; // Clear the explorer
  Object.keys(files).forEach((fileName) => {
    const li = document.createElement("li");

    // Create a span to hold the file name and status (saved or unsaved)
    const fileNameSpan = document.createElement("span");
    fileNameSpan.textContent = fileName;
    

    // Add the saved/unsaved symbol
    const unsavedSymbol = document.createElement("span");
    unsavedSymbol.classList.add("unsaved-symbol");
    unsavedSymbol.textContent = files[fileName] === "" ? "" : (isFileUnsaved && currentFileName === fileName ? "*" : "💾");
    fileNameSpan.appendChild(unsavedSymbol);

    li.appendChild(fileNameSpan); // Append the file name span

    // Add delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent triggering file opening
      deleteFile(fileName);
    });

    li.appendChild(deleteBtn); // Append delete button
    li.addEventListener("click", () => openFile(fileName, li)); // Add click event for opening
    fileExplorer.appendChild(li); // Add to explorer
  });
}

// Open file in the editor and highlight it in the file explorer
function openFile(fileName, fileElement) {
  currentFileName = fileName;
  codeEditor.value = files[fileName];
  isFileUnsaved = false; // Mark file as saved initially

  // Highlight the selected file
  highlightSelectedFile(fileElement);

  // Refresh the file explorer to update saved status
  loadFiles();
}

// Highlight the currently selected file
function highlightSelectedFile(selectedElement) {
  // Remove highlight from any previously selected file
  const allFiles = document.querySelectorAll("#file-explorer li");
  allFiles.forEach((file) => file.classList.remove("selected"));

  // Add highlight to the currently selected file
  selectedElement.classList.add("selected");
}

// Save the current file
function saveFile() {
  if (currentFileName) {
    files[currentFileName] = codeEditor.value;
    isFileUnsaved = false; // Reset unsaved status
    localStorage.setItem("files", JSON.stringify(files)); // Save to localStorage
    loadFiles(); // Refresh the file explorer to update saved status
    alert(`File "${currentFileName}" saved successfully!`);
  } else {
    alert("No file is open to save.");
  }
}

// Create and save a new file
document.getElementById("new-file").addEventListener("click", () => {
  const newFileName = prompt("Enter file name:");
  if (newFileName) {
    if (files[newFileName]) {
      alert("A file with this name already exists!");
    } else {
      files[newFileName] = "";
      localStorage.setItem("files", JSON.stringify(files)); // Save to localStorage
      loadFiles(); // Refresh the file explorer
      const newFileElement = [...fileExplorer.children].find(
        (child) => child.textContent === newFileName
      );
      openFile(newFileName, newFileElement);
    }
  }
});

// Delete a file
function deleteFile(fileName) {
  if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
    delete files[fileName]; // Remove the file from the object
    localStorage.setItem("files", JSON.stringify(files)); // Save changes to localStorage
    loadFiles(); // Refresh the file explorer
    if (currentFileName === fileName) {
      currentFileName = null; // Clear the editor if the open file was deleted
      codeEditor.value = "";
    }
  }
}

// Download all files
downloadBtn.addEventListener("click", () => {
  Object.keys(files).forEach((fileName) => {
    const fileContent = files[fileName];
    const blob = new Blob([fileContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName; // Use the file name as the downloaded file name
    link.click(); // Simulate click to trigger download
  });
});

// Custom behavior for the Tab key
codeEditor.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault(); // Prevent default tab behavior
    const start = codeEditor.selectionStart;
    const end = codeEditor.selectionEnd;

    // Insert four spaces at the cursor position
    const spaces = "    "; // Four spaces
    codeEditor.value =
      codeEditor.value.substring(0, start) +
      spaces +
      codeEditor.value.substring(end);

    // Move cursor to the end of the inserted spaces
    codeEditor.selectionStart = codeEditor.selectionEnd = start + spaces.length;
    
    isFileUnsaved = true; // Mark file as unsaved when modified
  }

  // Save file on Ctrl + S or Cmd + S
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault(); // Prevent the default browser save dialog
    saveFile();
  }

  // Mark file as unsaved on any change
  isFileUnsaved = true;
});

// Load files on page load
loadFiles();
