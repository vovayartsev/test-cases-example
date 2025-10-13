import streamlit as st
import yaml
import csv
from pathlib import Path
from datetime import datetime
from io import StringIO

# Configure Streamlit page
st.set_page_config(
    page_title="Test Case Manager",
    page_icon="📋",
    layout="wide"
)

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
                    st.error(f"Error loading {yaml_file}: {e}")

    return test_cases

def format_steps_for_csv(steps_text):
    """Format steps text for CSV (multiline format)."""
    return steps_text

def generate_csv(selected_test_cases):
    """Generate CSV content from selected test cases."""
    output = StringIO()
    writer = csv.writer(output)

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

    return output.getvalue()

def main():
    st.title("📋 Test Case Manager")
    st.markdown("Select test cases to include in your test run and export to CSV")

    # Load all test cases
    test_cases = load_test_cases()

    if not test_cases:
        st.warning("No test cases found. Please add test cases to the `test-cases/` directory.")
        return

    # Sidebar for filtering and selection
    st.sidebar.header("Filters")

    # Get unique sections
    sections = sorted(set(tc['section'] for tc in test_cases))
    selected_sections = st.sidebar.multiselect(
        "Filter by Section",
        options=sections,
        default=sections
    )

    # Filter test cases by selected sections
    filtered_test_cases = [tc for tc in test_cases if tc['section'] in selected_sections]

    # Stats
    st.sidebar.markdown("---")
    st.sidebar.metric("Total Test Cases", len(test_cases))
    st.sidebar.metric("Filtered Test Cases", len(filtered_test_cases))

    # Main content area
    col1, col2 = st.columns([2, 1])

    with col1:
        st.header("Test Cases")

    with col2:
        # Select all / Deselect all buttons
        col_btn1, col_btn2 = st.columns(2)
        with col_btn1:
            if st.button("Select All", use_container_width=True):
                st.session_state['selected_test_cases'] = [tc['id'] for tc in filtered_test_cases]
                st.rerun()
        with col_btn2:
            if st.button("Deselect All", use_container_width=True):
                st.session_state['selected_test_cases'] = []
                st.rerun()

    # Initialize session state for selections
    if 'selected_test_cases' not in st.session_state:
        st.session_state['selected_test_cases'] = []

    # Display test cases grouped by section
    for section in selected_sections:
        section_test_cases = [tc for tc in filtered_test_cases if tc['section'] == section]

        if section_test_cases:
            st.subheader(f"{section} ({len(section_test_cases)})")

            # Create a container for this section
            for tc in section_test_cases:
                with st.expander(f"**{tc['id']}**: {tc['feature']}", expanded=False):
                    col_check, col_content = st.columns([1, 9])

                    with col_check:
                        is_selected = tc['id'] in st.session_state['selected_test_cases']
                        if st.checkbox("Select", value=is_selected, key=f"check_{tc['id']}"):
                            if tc['id'] not in st.session_state['selected_test_cases']:
                                st.session_state['selected_test_cases'].append(tc['id'])
                        else:
                            if tc['id'] in st.session_state['selected_test_cases']:
                                st.session_state['selected_test_cases'].remove(tc['id'])

                    with col_content:
                        st.markdown(f"**Feature:** {tc['feature']}")
                        st.markdown(f"**Section:** {tc['section']}")
                        st.markdown(f"**Date Created:** {tc['date_created']}")
                        st.markdown("**Steps:**")
                        st.text(tc['steps'])

    # Export section
    st.markdown("---")
    st.header("Export Test Run")

    # Get selected test cases
    selected_ids = st.session_state.get('selected_test_cases', [])
    selected_test_cases_data = [tc for tc in test_cases if tc['id'] in selected_ids]

    col1, col2, col3 = st.columns([2, 1, 1])

    with col1:
        st.metric("Selected Test Cases", len(selected_test_cases_data))

    with col2:
        # Input for filename
        filename = st.text_input(
            "Filename (without .csv)",
            value=f"test-run-{datetime.now().strftime('%Y%m%d')}",
            help="Enter the filename for the CSV export"
        )

    with col3:
        st.write("")  # Spacing
        st.write("")  # Spacing
        if st.button("📥 Download CSV", type="primary", use_container_width=True, disabled=len(selected_test_cases_data) == 0):
            if selected_test_cases_data:
                csv_content = generate_csv(selected_test_cases_data)
                st.download_button(
                    label="💾 Save CSV File",
                    data=csv_content,
                    file_name=f"{filename}.csv",
                    mime="text/csv",
                    use_container_width=True
                )

    # Preview selected test cases
    if selected_test_cases_data:
        st.subheader("Selected Test Cases Preview")

        # Create a preview dataframe
        preview_data = []
        for tc in selected_test_cases_data:
            preview_data.append({
                'ID': tc['id'],
                'Section': tc['section'],
                'Feature': tc['feature'],
                'Steps Preview': tc['steps'][:100] + '...' if len(tc['steps']) > 100 else tc['steps']
            })

        st.dataframe(preview_data, use_container_width=True)

if __name__ == "__main__":
    main()
