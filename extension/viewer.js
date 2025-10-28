const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/vovayartsev/test-cases-example/refs/heads/main/cache.txt';

// State management
const state = {
  testData: [],
  expandedSections: new Set(),
  selectedSections: new Set(),
  selectedTestCases: new Set(),
};

// SVG icons
const icons = {
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
};

// Parse test cases from raw GitHub content
function parseTestCases(content) {
  const testCases = [];
  const blocks = content.split('---').filter(block => block.trim());

  for (let i = 0; i < blocks.length; i += 2) {
    if (i + 1 >= blocks.length) break;

    const metadata = blocks[i].trim();
    const steps = blocks[i + 1].trim();

    // Parse metadata
    const metaLines = metadata.split('\n');
    const testCase = {};

    metaLines.forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        testCase[match[1]] = match[2];
      }
    });

    // Parse steps
    if (steps.startsWith('Steps:')) {
      const stepsList = steps.replace('Steps:', '').trim();
      testCase.steps = stepsList;
    }

    if (testCase.id && testCase.section) {
      testCases.push(testCase);
    }
  }

  return testCases;
}

// Organize test cases into sections
function organizeIntoSections(testCases) {
  const sections = {};

  testCases.forEach(tc => {
    if (!sections[tc.section]) {
      sections[tc.section] = {
        id: tc.section.toLowerCase().replace(/\s+/g, '-'),
        name: tc.section,
        testCases: [],
      };
    }
    sections[tc.section].testCases.push({
      id: tc.id,
      name: tc.feature,
    });
  });

  return Object.values(sections);
}

// UI rendering functions
function renderTestCaseTree() {
  const container = document.getElementById('testCaseTree');
  container.innerHTML = '';

  state.testData.forEach(section => {
    const sectionElement = createSectionElement(section);
    container.appendChild(sectionElement);
  });
}

function createSectionElement(section) {
  const sectionDiv = document.createElement('div');
  sectionDiv.className = 'test-section';

  const header = document.createElement('div');
  header.className = 'section-header';

  // Expand button
  const expandBtn = document.createElement('button');
  expandBtn.className = 'expand-button';
  if (state.expandedSections.has(section.id)) {
    expandBtn.classList.add('expanded');
  }
  expandBtn.innerHTML = icons.chevronRight;
  expandBtn.onclick = (e) => {
    e.stopPropagation();
    toggleSectionExpand(section.id);
  };

  // Checkbox
  const checkbox = createCheckbox(
    isSectionSelected(section),
    isSectionIndeterminate(section),
    () => toggleSectionSelection(section.id)
  );

  // Folder icon
  const folderIcon = document.createElement('span');
  folderIcon.className = 'folder-icon';
  folderIcon.innerHTML = icons.folder;

  // Label
  const label = document.createElement('label');
  label.className = 'section-label';
  label.textContent = section.name;
  label.onclick = () => toggleSectionSelection(section.id);

  header.appendChild(expandBtn);
  header.appendChild(checkbox);
  header.appendChild(folderIcon);
  header.appendChild(label);

  sectionDiv.appendChild(header);

  // Test cases list
  const testCasesList = document.createElement('div');
  testCasesList.className = 'test-cases-list';
  if (state.expandedSections.has(section.id)) {
    testCasesList.classList.add('expanded');
  }

  section.testCases.forEach(testCase => {
    const testCaseElement = createTestCaseElement(testCase, section.id);
    testCasesList.appendChild(testCaseElement);
  });

  sectionDiv.appendChild(testCasesList);

  return sectionDiv;
}

function createTestCaseElement(testCase, sectionId) {
  const div = document.createElement('div');
  div.className = 'test-case-item';

  // Spacer
  const spacer = document.createElement('div');
  spacer.className = 'spacer';

  // Checkbox
  const isDisabled = state.selectedSections.has(sectionId);
  const isChecked = state.selectedTestCases.has(testCase.id) || isDisabled;
  const checkbox = createCheckbox(
    isChecked,
    false,
    () => toggleTestCaseSelection(testCase.id, sectionId),
    isDisabled
  );

  // File icon
  const fileIcon = document.createElement('span');
  fileIcon.className = 'file-icon';
  fileIcon.innerHTML = icons.file;

  // Label
  const label = document.createElement('label');
  label.className = 'test-case-label';
  label.innerHTML = `<span class="test-case-id">${testCase.id}</span>${testCase.name}`;
  if (!isDisabled) {
    label.onclick = () => toggleTestCaseSelection(testCase.id, sectionId);
  }

  div.appendChild(spacer);
  div.appendChild(checkbox);
  div.appendChild(fileIcon);
  div.appendChild(label);

  return div;
}

function createCheckbox(checked, indeterminate, onChange, disabled = false) {
  const checkbox = document.createElement('div');
  checkbox.className = 'checkbox';

  if (checked) checkbox.classList.add('checked');
  if (indeterminate) checkbox.classList.add('indeterminate');

  const icon = indeterminate ? icons.minus : icons.check;
  checkbox.innerHTML = icon;

  if (!disabled) {
    checkbox.onclick = (e) => {
      e.stopPropagation();
      onChange();
    };
  } else {
    checkbox.style.opacity = '0.6';
    checkbox.style.cursor = 'not-allowed';
  }

  return checkbox;
}

// Selection logic
function toggleSectionExpand(sectionId) {
  if (state.expandedSections.has(sectionId)) {
    state.expandedSections.delete(sectionId);
  } else {
    state.expandedSections.add(sectionId);
  }
  renderTestCaseTree();
}

function toggleSectionSelection(sectionId) {
  const section = state.testData.find(s => s.id === sectionId);
  if (!section) return;

  if (state.selectedSections.has(sectionId)) {
    // Deselect section
    state.selectedSections.delete(sectionId);
  } else {
    // Select section and remove individual test case selections
    state.selectedSections.add(sectionId);
    section.testCases.forEach(tc => {
      state.selectedTestCases.delete(tc.id);
    });
  }

  renderTestCaseTree();
  updatePreview();
}

function toggleTestCaseSelection(testCaseId, sectionId) {
  // Don't allow toggling if entire section is selected
  if (state.selectedSections.has(sectionId)) return;

  if (state.selectedTestCases.has(testCaseId)) {
    state.selectedTestCases.delete(testCaseId);
  } else {
    state.selectedTestCases.add(testCaseId);
  }

  renderTestCaseTree();
  updatePreview();
}

function isSectionSelected(section) {
  return state.selectedSections.has(section.id);
}

function isSectionIndeterminate(section) {
  if (state.selectedSections.has(section.id)) return false;
  return section.testCases.some(tc => state.selectedTestCases.has(tc.id));
}

// Markdown generation
function generateMarkdown() {
  let markdown = '# Test Run\n\n';

  state.testData.forEach(section => {
    const isSectionSelected = state.selectedSections.has(section.id);
    const selectedTestCases = section.testCases.filter(
      tc => state.selectedTestCases.has(tc.id) || isSectionSelected
    );

    if (selectedTestCases.length > 0) {
      markdown += `## ${section.name}\n`;
      selectedTestCases.forEach(testCase => {
        markdown += `- [ ] ${testCase.id}   ${testCase.name}\n`;
      });
      markdown += '\n';
    }
  });

  return markdown;
}

function updatePreview() {
  const markdown = generateMarkdown();
  const hasSelection = state.selectedSections.size > 0 || state.selectedTestCases.size > 0;

  const emptyEl = document.getElementById('previewEmpty');
  const boxEl = document.getElementById('previewBox');
  const previewEl = document.getElementById('markdownPreview');
  const copyBtn = document.getElementById('copyButton');

  if (hasSelection) {
    emptyEl.style.display = 'none';
    boxEl.style.display = 'block';
    previewEl.textContent = markdown;
    copyBtn.disabled = false;
  } else {
    emptyEl.style.display = 'flex';
    boxEl.style.display = 'none';
    copyBtn.disabled = true;
  }
}

// Copy to clipboard
async function copyMarkdownToClipboard() {
  const markdown = generateMarkdown();
  const copyBtn = document.getElementById('copyButton');
  const copyBtnText = document.getElementById('copyButtonText');

  try {
    await navigator.clipboard.writeText(markdown);
    copyBtnText.textContent = 'Copied!';
    setTimeout(() => {
      copyBtnText.textContent = 'Copy Markdown';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  }
}

// Show/hide states
function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('error').classList.remove('visible');
  document.querySelector('.container').classList.add('loading');
}

function showError(message) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('error').classList.add('visible');
  document.getElementById('errorMessage').textContent = message;
  document.querySelector('.container').classList.add('error');
}

function showContent() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('error').classList.remove('visible');
  document.querySelector('.container').classList.remove('loading', 'error');
}

// Fetch and load test cases
async function loadTestCases() {
  showLoading();

  try {
    // Try fetching directly
    let response = await fetch(GITHUB_RAW_URL, {
      credentials: 'include',
      headers: {
        'Accept': 'text/plain'
      }
    });

    if (!response.ok) {
      // Fallback to background script
      const result = await chrome.runtime.sendMessage({
        action: 'fetchWithAuth',
        url: GITHUB_RAW_URL
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch test cases');
      }

      const testCases = parseTestCases(result.content);
      state.testData = organizeIntoSections(testCases);
    } else {
      const content = await response.text();
      const testCases = parseTestCases(content);
      state.testData = organizeIntoSections(testCases);
    }

    // Expand all sections by default
    state.testData.forEach(section => {
      state.expandedSections.add(section.id);
    });

    renderTestCaseTree();
    updatePreview();
    showContent();

  } catch (error) {
    console.error('Error loading test cases:', error);
    showError(
      `${error.message}\n\nMake sure:\n1. You are signed in to GitHub\n2. You have access to the repository\n3. The extension has the necessary permissions`
    );
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set up copy button
  document.getElementById('copyButton').addEventListener('click', copyMarkdownToClipboard);

  // Load test cases
  loadTestCases();
});
