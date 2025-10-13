# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a test case management system that stores test cases as YAML files and exports them to CSV format for test runs. The system is designed for an event management application with three main sections: Landing, Admin, and Checkout.

## Commands

### Running the Streamlit Dashboard
```bash
uv run streamlit run main.py
```
This launches the interactive Test Case Manager dashboard at http://localhost:8501

### Dependencies
This project uses `uv` for dependency management. Install dependencies with:
```bash
uv sync
```

### Python Version
Requires Python 3.11 or higher. Dependencies include:
- Streamlit (1.50.0+) - Web dashboard framework
- PyYAML (6.0.3+) - YAML parsing for test cases

## Repository Structure

### Test Cases (`test-cases/`)
Test cases are organized by section (Landing, Admin, Checkout) and stored as YAML files with the following structure:

```yaml
---
id: [SECTION_PREFIX]-[NUMBER]
section: [Section Name]
feature: [Feature Name]
date_created: YYYY-MM-DD
---
Steps:
1. Step description
2. Step description
...
```

**Naming Convention**: Test case files use the pattern `{SECTION_PREFIX}-{NUMBER}.yml` where:
- Landing section: `L-1.yml`, `L-2.yml`, etc.
- Admin section: `A-1.yml`, `A-2.yml`, etc.
- Checkout section: `C-1.yml`, `C-2.yml`, etc.

### Test Runs (`test-runs/`)
Test runs are CSV files that combine multiple test cases for execution tracking. The CSV format includes:
- `id`: Test case ID
- `Section`: Section name
- `Feature`: Feature being tested
- `Steps`: Multi-line step descriptions
- `QA-pass`: Empty field for marking pass/fail
- `Notes`: Empty field for test execution notes

The `template.csv` file contains the basic structure, while other CSV files (e.g., `event-mgmt.csv`) represent specific test run configurations.

## Architecture Notes

- **main.py**: Streamlit dashboard application that provides a web UI for managing test cases
  - `load_test_cases()`: Recursively loads all YAML test cases from the `test-cases/` directory
  - `generate_csv()`: Exports selected test cases to CSV format with empty QA-pass and Notes columns
  - Uses Streamlit session state to track user selections across page interactions
- Test cases are the source of truth and are stored as individual YAML files for version control and easy editing
- CSV files in `test-runs/` are generated from YAML test cases and include additional columns for tracking test execution results
- Steps in CSV format use multi-line text with numbered steps, preserving the exact formatting from YAML
- Each test case has a unique ID that follows the section prefix pattern for easy categorization

## Using the Dashboard

The Streamlit dashboard provides:
1. **Browse test cases**: View all test cases organized by section (Admin, Checkout, Landing)
2. **Filter by section**: Use the sidebar to filter test cases by specific sections
3. **Select test cases**: Check individual test cases or use "Select All" / "Deselect All" buttons
4. **Preview selection**: View a table of all selected test cases before export
5. **Export to CSV**: Generate a test run CSV file with custom filename for tracking test execution

## Working with Test Cases

When creating or modifying test cases:
1. Use the established YAML frontmatter format with id, section, feature, and date_created
2. Follow the section-based ID prefix convention (L-, A-, C-)
3. Keep steps numbered and action-oriented
4. Ensure each test case focuses on a single feature or user flow

## Rendering test run

When asked to render a test run for a certain criteria
1. read test cases and remember matching IDs
2. pass these IDs to render.py, e.g.: `python render.py L-1 L-2 A-3` - this will create `/tmp/test-run.csv`
3. collaborate with the user by adding/removing lines to  /tmp/test-run.csv