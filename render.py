#!/usr/bin/env python3
"""
Render test cases as CSV from command line.

Usage:
    python render.py L-1 L-2 A-3
    python render.py L-1 L-2 A-3 --output /tmp/custom-name.csv
"""
import argparse
import csv
import sys
import yaml
from pathlib import Path


def load_test_cases():
    """Load all test cases from the test-cases directory."""
    test_cases_dir = Path("test-cases")
    test_cases = []

    if not test_cases_dir.exists():
        return test_cases

    # Iterate through all sections
    for section_dir in sorted(test_cases_dir.iterdir()):
        if section_dir.is_dir():
            # Load all YAML files in the section
            for yaml_file in sorted(section_dir.glob("*.yml")):
                try:
                    with open(yaml_file, 'r') as f:
                        content = f.read()
                        # Split YAML frontmatter and steps
                        parts = content.split('---')
                        if len(parts) >= 3:
                            frontmatter = yaml.safe_load(parts[1])
                            steps_text = parts[2].strip()

                            # Parse steps
                            if steps_text.startswith('Steps:'):
                                steps_text = steps_text[6:].strip()

                            test_case = {
                                'id': frontmatter.get('id', ''),
                                'section': frontmatter.get('section', ''),
                                'feature': frontmatter.get('feature', ''),
                                'date_created': frontmatter.get('date_created', ''),
                                'steps': steps_text,
                                'file_path': str(yaml_file)
                            }
                            test_cases.append(test_case)
                except Exception as e:
                    print(f"Error loading {yaml_file}: {e}", file=sys.stderr)

    return test_cases


def generate_csv_file(selected_test_cases, output_path):
    """Generate CSV file from selected test cases."""
    with open(output_path, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)

        # Write header
        writer.writerow(['id', 'Section', 'Feature', 'Steps', 'QA-pass', 'Notes'])

        # Write test cases
        for tc in selected_test_cases:
            writer.writerow([
                tc['id'],
                tc['section'],
                tc['feature'],
                tc['steps'],
                '',  # QA-pass column (empty for user to fill)
                ''   # Notes column (empty for user to fill)
            ])


def main():
    parser = argparse.ArgumentParser(
        description='Render test cases as CSV from command line',
        epilog='Example: python render.py L-1 L-2 A-3'
    )
    parser.add_argument(
        'test_case_ids',
        nargs='+',
        help='Test case IDs to include (e.g., L-1 L-2 A-3)'
    )
    parser.add_argument(
        '--output',
        '-o',
        default='/tmp/test-run.csv',
        help='Output CSV file path (default: /tmp/test-run.csv)'
    )

    args = parser.parse_args()

    # Load all test cases
    print("Loading test cases...", file=sys.stderr)
    all_test_cases = load_test_cases()

    if not all_test_cases:
        print("Error: No test cases found in test-cases/ directory", file=sys.stderr)
        sys.exit(1)

    # Create lookup dictionary for quick access
    test_cases_by_id = {tc['id']: tc for tc in all_test_cases}

    # Filter test cases by requested IDs
    selected_test_cases = []
    missing_ids = []

    for test_id in args.test_case_ids:
        if test_id in test_cases_by_id:
            selected_test_cases.append(test_cases_by_id[test_id])
        else:
            missing_ids.append(test_id)

    # Report missing IDs
    if missing_ids:
        print(f"Warning: Test case IDs not found: {', '.join(missing_ids)}", file=sys.stderr)

    if not selected_test_cases:
        print("Error: No valid test case IDs provided", file=sys.stderr)
        sys.exit(1)

    # Generate CSV
    output_path = Path(args.output)

    # Create parent directory if it doesn't exist
    output_path.parent.mkdir(parents=True, exist_ok=True)

    generate_csv_file(selected_test_cases, output_path)

    print(f"Successfully rendered {len(selected_test_cases)} test case(s) to {output_path}", file=sys.stderr)
    print(f"Output file: {output_path}")


if __name__ == "__main__":
    main()
