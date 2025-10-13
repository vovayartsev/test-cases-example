# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a test case management system that stores test cases as YAML files and exports them to CSV format for test runs. The system is designed for an event management application with three main sections: Landing, Admin, and Checkout.

## Commands

### Running the Application
```bash
uv run main.py
```

### Dependencies
This project uses `uv` for dependency management. Install dependencies with:
```bash
uv sync
```

### Python Version
Requires Python 3.11 or higher. The project uses Streamlit (version 1.50.0+) as a dependency.

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

- Test cases are the source of truth and are stored as individual YAML files for version control and easy editing
- CSV files in `test-runs/` are generated from YAML test cases and include additional columns for tracking test execution results
- Steps in CSV format use multi-line text with numbered steps, preserving the exact formatting from YAML
- Each test case has a unique ID that follows the section prefix pattern for easy categorization

## Working with Test Cases

When creating or modifying test cases:
1. Use the established YAML frontmatter format with id, section, feature, and date_created
2. Follow the section-based ID prefix convention (L-, A-, C-)
3. Keep steps numbered and action-oriented
4. Ensure each test case focuses on a single feature or user flow
